import { useState, useEffect } from "react";
import "./AdManagePage.css";
import { adList, adDelete } from "../api/ads";

const TARGET_TYPE_DISPLAY = {
  PRODUCT:  "상품",
  CATEGORY: "카테고리",
  KEYWORD:  "키워드",
};

const CATEGORY_DISPLAY = {
  BEAUTY:             "뷰티",
  FASHION_ACCESSORY:  "패션잡화",
  LIVING_HEALTH:      "생활건강",
  FURNITURE_INTERIOR: "가구인테리어",
  FOOD:               "식품",
  SPORTS_LEISURE:     "스포츠레저",
  DIGITAL_APPLIANCE:  "가전/디지털",
  FASHION_CLOTHING:   "패션의류",
};

const TARGET_TYPE_STYLE = {
  "상품":    { color: "#4F6EF7", background: "rgba(79,110,247,0.12)" },
  "카테고리": { color: "#2ABFBF", background: "rgba(42,191,191,0.12)" },
  "키워드":  { color: "#FF6B6B", background: "rgba(255,107,107,0.12)" },
};

function getTargetInfo(ad) {
  const type = TARGET_TYPE_DISPLAY[ad.targetType] ?? "–";
  let value = "–";
  if (ad.targetType === "PRODUCT")  value = `ID: ${ad.productId}`;
  if (ad.targetType === "CATEGORY") value = CATEGORY_DISPLAY[ad.category] ?? ad.category;
  if (ad.targetType === "KEYWORD")  value = ad.keyword;
  return { type, value };
}

export default function AdManagePage({ onNavigate }) {
  const [ads,        setAds]        = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => { fetchAds(); }, []);

  async function fetchAds() {
    setLoading(true); setError(null);
    try {
      const data = await adList();
      setAds(Array.isArray(data) ? data : []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleDelete(adId) {
    if (!window.confirm("광고를 삭제하시겠습니까?")) return;
    try {
      await adDelete({ adId });
      setAds(prev => prev.filter(a => a.adId !== adId));
    } catch (err) { alert(err.message); }
  }

  const filtered = ads.filter(a =>
    !searchText || a.adName?.includes(searchText)
  );

  return (
    <div className="ad-main">
      <div className="ad-page-header">
        <div>
          <h1 className="ad-page-title">광고 관리</h1>
          <p className="ad-page-sub">광고를 등록하고 관리합니다</p>
        </div>
        <button className="ad-btn-primary" onClick={() => onNavigate?.("create")}>+ 광고 등록</button>
      </div>

      <div className="ad-content">
        {/* 검색 카드 - 쿠폰 목록과 동일 스타일 */}
        <div style={{
          background: "#FFFFFF",
          borderRadius: 12,
          boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "0 20px",
          height: 56,
        }}>
          <span style={{
            fontFamily: "'Noto Sans KR', sans-serif",
            fontWeight: 700,
            fontSize: 12,
            color: "#9EA6B5",
            whiteSpace: "nowrap",
          }}>검색</span>
          <div style={{
            display: "flex",
            alignItems: "center",
            width: 260,
            height: 30,
            background: "#FFFFFF",
            border: "1px solid #EBEDF0",
            borderRadius: 6,
            flexShrink: 0,
          }}>
            <input
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                padding: "0 12px",
                fontFamily: "'Noto Sans KR', sans-serif",
                fontSize: 12,
                color: "#333",
              }}
              placeholder="광고명 검색"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </div>
        </div>

        {/* 테이블 카드 */}
        <div className="ad-table-card">
          {loading && <div style={{ padding: 24, textAlign: "center", fontSize: 12, color: "#9EA6B5" }}>불러오는 중...</div>}
          {error   && <div style={{ padding: 24, color: "#B82B2B", fontSize: 12 }}>{error}</div>}
          {!loading && !error && (
            <table className="ad-table">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>고유번호</th>
                  <th>광고명</th>
                  <th style={{ width: 120 }}>생성시간</th>
                  <th style={{ width: 100 }}>타겟 유형</th>
                  <th style={{ width: 160 }}>타겟 값</th>
                  <th style={{ width: 100, textAlign: "center" }}>액션</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 24, fontSize: 12, color: "#9EA6B5" }}>광고가 없습니다</td></tr>
                ) : filtered.map((ad, i) => {
                  const { type, value } = getTargetInfo(ad);
                  const badgeStyle = TARGET_TYPE_STYLE[type] ?? {};
                  return (
                    <tr key={ad.adId} className={i % 2 === 1 ? "ad-row-alt" : ""}>
                      <td style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#4F6EF7", fontWeight: 600 }}>{ad.adId}</td>
                      <td className="ad-td-name"><span className="ad-name">{ad.adName}</span></td>
                      <td style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#9EA6B5" }}>
                        {ad.createdAt?.substring(0, 19).replace("T", " ")}
                      </td>
                      <td>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "3px 10px",
                          borderRadius: 4,
                          fontFamily: "'Noto Sans KR', sans-serif",
                          fontWeight: 700,
                          fontSize: 11,
                          ...badgeStyle,
                        }}>
                          {type}
                        </span>
                      </td>
                      <td style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#333" }}>{value}</td>
                      <td>
                        <div className="ad-action-btns">
                          <button className="ad-btn-edit" onClick={() => onNavigate?.("create", ad)}>수정</button>
                          <button className="ad-btn-stop" onClick={() => handleDelete(ad.adId)}>삭제</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}