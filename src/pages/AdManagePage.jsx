import { useState } from "react";
import "./AdManagePage.css";

const MOCK_ADS = [
  { id: 1, name: "출근시간 맞춤광고",  createdAt: "2026-04-01", productId: 1023, category: null,   keyword: null    },
  { id: 2, name: "심사숙고 이탈방지",  createdAt: "2026-04-03", productId: null, category: "스포츠", keyword: null    },
  { id: 3, name: "재구매 소모품 광고", createdAt: "2026-04-05", productId: null, category: null,   keyword: "축구화" },
  { id: 4, name: "장바구니 리마인드",  createdAt: "2026-04-10", productId: 2041, category: null,   keyword: null    },
  { id: 5, name: "신규회원 웰컴배너",  createdAt: "2026-04-15", productId: null, category: "패션",  keyword: null    },
];

const getTargetLabel = (ad) => {
  if (ad.productId) return { type: "상품",    value: `ID: ${ad.productId}` };
  if (ad.category)  return { type: "카테고리", value: ad.category };
  if (ad.keyword)   return { type: "키워드",   value: ad.keyword };
  return { type: "–", value: "–" };
};

const TARGET_TYPE_STYLE = {
  "상품":    { color: "#4F6EF7", bg: "rgba(79,110,247,0.12)" },
  "카테고리": { color: "#2ABFBF", bg: "rgba(42,191,191,0.12)" },
  "키워드":  { color: "#FF6B6B", bg: "rgba(255,107,107,0.12)" },
};

export default function AdManagePage({ onNavigate }) {
  const [ads, setAds] = useState(MOCK_ADS);

  const deleteAd = (id) => setAds(prev => prev.filter(a => a.id !== id));

  return (
    <div className="ad-main">
      {/* ── 흰색 Page Header ── */}
      <div className="ad-page-header">
        <div>
          <h1 className="ad-page-title">광고 관리</h1>
          <p className="ad-page-sub">광고를 등록하고 관리합니다</p>
        </div>
        <button className="ad-btn-primary" onClick={() => onNavigate?.("create")}>+ 광고 등록</button>
      </div>

      {/* ── 회색 콘텐츠 ── */}
      <div className="ad-content">
        <div className="ad-table-card">
          <table className="ad-table">
            <thead>
              <tr>
                <th>고유번호</th>
                <th>광고명</th>
                <th>생성시간</th>
                <th>타겟 유형</th>
                <th>타겟 값</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad, i) => {
                const target = getTargetLabel(ad);
                const style  = TARGET_TYPE_STYLE[target.type] ?? {};
                return (
                  <tr key={ad.id} className={i % 2 === 1 ? "ad-row-alt" : ""}>
                    <td className="ad-td-id">{ad.id}</td>
                    <td className="ad-td-name">
                      <span className="ad-name">{ad.name}</span>
                    </td>
                    <td className="ad-td-date">{ad.createdAt}</td>
                    <td>
                      <span
                        className="ad-target-badge"
                        style={{ color: style.color, background: style.bg }}
                      >
                        {target.type}
                      </span>
                    </td>
                    <td className="ad-td-target">{target.value}</td>
                    <td>
                      <div className="ad-action-btns">
                        <button className="ad-btn-edit">수정</button>
                        <button className="ad-btn-stop" onClick={() => deleteAd(ad.id)}>삭제</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}