import { useState } from "react";
import "./CouponListPage.css";

const MOCK_COUPONS = [
  { name: "신규가입 웰컴쿠폰", code: "WELCOME25", discount: "5,000원",  validDays: 30, issueType: "자동 지급",  quantity: "무제한" },
  { name: "4월 봄맞이 할인",   code: "SPRING04",  discount: "10%",      validDays: 14, issueType: "다운로드",   quantity: "5,000" },
  { name: "심사숙고 긴급쿠폰", code: "HURRY30M",  discount: "8%",       validDays: 1,  issueType: "자동 지급",  quantity: "무제한" },
  { name: "VIP 전용 혜택",     code: "VIP2025",   discount: "15,000원", validDays: 60, issueType: "자동 지급",  quantity: "300" },
  { name: "이탈방지 쿠폰",     code: "COMEBACK",  discount: "7%",       validDays: 7,  issueType: "다운로드",   quantity: "1,200" },
  { name: "재구매 감사 쿠폰",  code: "THANKS10",  discount: "10,000원", validDays: 30, issueType: "자동 지급",  quantity: "무제한" },
  { name: "생일 축하 쿠폰",    code: "BDAY2025",  discount: "20%",      validDays: 1,  issueType: "자동 지급",  quantity: "무제한" },
];

export default function CouponListPage({ onNavigate }) {
  const [searchText,  setSearchText]  = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  const filteredData = MOCK_COUPONS.filter((c) => {
    return !searchText || c.name.includes(searchText) || c.code.includes(searchText);
  });

  return (
    <div className="cp-main">
      {/* ── 흰색 Page Header ── */}
      <div className="cp-page-header">
        <div>
          <h1 className="cp-page-title">쿠폰 관리</h1>
          <p className="cp-page-sub">쿠폰 발급, 현황 및 통계를 관리합니다</p>
        </div>
        <button className="cp-btn-primary" onClick={() => onNavigate("create")}>+ 쿠폰 등록</button>
      </div>

      {/* ── 회색 콘텐츠 ── */}
      <div className="cp-content">

        {/* 검색 */}
        <div className="cp-search-card">
          <span className="cp-search-label">검색</span>
          <div className="cp-search-wrap">
            <input
              className="cp-search"
              placeholder="쿠폰명 또는 코드 검색"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        {/* 테이블 */}
        <div className="cp-table-card">
          <table className="cp-table">
            <thead>
              <tr>
                <th>쿠폰명</th>
                <th>쿠폰코드</th>
                <th>할인금액</th>
                <th>유효기간</th>
                <th>발급방식</th>
                <th>발급수량</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((c, i) => (
                <tr key={i} className={i % 2 === 1 ? "cp-row-alt" : ""}>
                  <td className="cp-td-name">{c.name}</td>
                  <td className="cp-td-code">{c.code}</td>
                  <td>{c.discount}</td>
                  <td>{c.validDays}일</td>
                  <td>{c.issueType}</td>
                  <td>{c.quantity === "무제한" ? "무제한" : `${c.quantity}건`}</td>
                  <td>
                    <div className="cp-action-btns">
                      <button className="cp-btn-edit">수정</button>
                      <button className="cp-btn-delete">삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 페이지네이션 */}
          <div className="cp-pagination">
            <button className="cp-page-nav" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>
              &lt; 이전
            </button>
            {[1, 2, 3, 4, 5].map((p) => (
              <button
                key={p}
                className={`cp-page-btn ${currentPage === p ? "cp-page-active" : ""}`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}
            <button className="cp-page-nav" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}>
              다음 &gt;
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}