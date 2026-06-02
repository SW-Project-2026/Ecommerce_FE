import { useState, useEffect } from "react";
import "./CouponListPage.css";
import { couponList, couponDelete } from "../api/coupons";

const DISCOUNT_TYPE_DISPLAY = { FIXED: "정액할인", RATE: "정률할인" };

export default function CouponListPage({ onNavigate }) {
  const [coupons,     setCoupons]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [searchText,  setSearchText]  = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => { fetchCoupons(); }, []);

  async function fetchCoupons() {
    setLoading(true); setError(null);
    try {
      const data = await couponList();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(couponId) {
    if (!window.confirm("쿠폰을 삭제하시겠습니까?")) return;
    try {
      await couponDelete({ couponId });
      setCoupons(prev => prev.filter(c => c.couponId !== couponId));
    } catch (err) {
      alert(err.message);
    }
  }

  const filtered = coupons.filter(c =>
    !searchText || c.name?.includes(searchText) || c.code?.includes(searchText)
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="cp-main">
      <div className="cp-page-header">
        <div>
          <h1 className="cp-page-title">쿠폰 관리</h1>
          <p className="cp-page-sub">쿠폰 발급, 현황 및 통계를 관리합니다</p>
        </div>
        <button className="cp-btn-primary" onClick={() => onNavigate("create")}>+ 쿠폰 등록</button>
      </div>

      <div className="cp-content">
        <div className="cp-search-card">
          <span className="cp-search-label">검색</span>
          <div className="cp-search-wrap">
            <input
              className="cp-search"
              placeholder="쿠폰명 또는 코드 검색"
              value={searchText}
              onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        <div className="cp-table-card">
          {loading && <div className="cp-loading">불러오는 중...</div>}
          {error   && <div className="cp-error">{error}</div>}
          {!loading && !error && (
            <table className="cp-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>쿠폰명</th>
                  <th>쿠폰코드</th>
                  <th>할인유형</th>
                  <th>할인금액</th>
                  <th>유효기간</th>
                  <th>발급수량</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: 24 }}>쿠폰이 없습니다</td></tr>
                ) : paginated.map((c, i) => {
                  const globalNo = (currentPage - 1) * PAGE_SIZE + i + 1;
                  return (
                    <tr key={c.couponId}>
                      <td>{globalNo}</td>
                      <td className="cp-td-name">{c.name}</td>
                      <td className="cp-td-code">{c.code}</td>
                      <td>{DISCOUNT_TYPE_DISPLAY[c.discountType] ?? c.discountType}</td>
                      <td>{c.discountType === "RATE" ? `${c.discountAmount}%` : `${c.discountAmount?.toLocaleString()}원`}</td>
                      <td>{c.expiredAt}일</td>
                      <td>{c.issueLimit === null ? "무제한" : `${c.issueLimit?.toLocaleString()}건`}</td>
                      <td>
                        <div className="cp-action-btns">
                          <button className="cp-btn-edit" onClick={() => onNavigate("create", c)}>수정</button>
                          <button className="cp-btn-delete" onClick={() => handleDelete(c.couponId)}>삭제</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <div className="cp-pagination">
            <button className="cp-page-nav" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>&lt; 이전</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`cp-page-btn ${currentPage === p ? "cp-page-active" : ""}`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}
            <button className="cp-page-nav" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>다음 &gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}