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

const TARGET_TYPE_BADGE = {
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
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 12,
            color: "#666666",
            whiteSpace: "nowrap",
          }}>검색</span>
          <div style={{
            display: "flex",
            alignItems: "center",
            width: 240,
            height: 35,
            background: "#F5F6FA",
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
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                color: "#333",
              }}
              placeholder="광고명 검색"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </div>
        </div>

        <div className="ad-table-card">
          {loading && (
            <div style={{ textAlign: "center", padding: 40, fontFamily: "'Noto Sans KR', sans-serif", fontSize: 13, color: "#9EA6B5" }}>
              불러오는 중...
            </div>
          )}
          {error && (
            <div style={{ textAlign: "center", padding: 40, fontFamily: "'Noto Sans KR', sans-serif", fontSize: 13, color: "#D94F4F" }}>
              {error}
            </div>
          )}
          {!loading && !error && (
            <table className="ad-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>광고명</th>
                  <th>생성시간</th>
                  <th>타겟 유형</th>
                  <th>타겟 값</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 40 }}>광고가 없습니다</td></tr>
                ) : filtered.map((ad, i) => {
                  const { type, value } = getTargetInfo(ad);
                  const badgeStyle = TARGET_TYPE_BADGE[type] ?? {};
                  return (
                    <tr key={ad.adId}>
                      <td>{i + 1}</td>
                      <td className="ad-td-name" style={{ cursor: "pointer", color: "#4F6EF7" }} onClick={() => onNavigate?.("detail", ad)}>{ad.adName}</td>
                      <td className="ad-td-date">{ad.createdAt?.substring(0, 19).replace("T", " ")}</td>
                      <td>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "3px 10px",
                          borderRadius: 4,
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 700,
                          fontSize: 11,
                          ...badgeStyle,
                        }}>
                          {type}
                        </span>
                      </td>
                      <td>{value}</td>
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