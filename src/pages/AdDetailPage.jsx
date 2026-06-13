import { useState, useEffect } from "react";
import "./AdCreatePage.css";
import { adDetail, adDelete } from "../api/ads";
import { getProduct, getProducts, searchProducts } from "../api/products";
import AdCreatePage from "./AdCreatePage";

const TARGET_TYPE_DISPLAY_MAP = {
  PRODUCT:  "상품",
  CATEGORY: "카테고리",
  KEYWORD:  "키워드",
};

const CATEGORY_OPTIONS = [
  { label: "가전/디지털", value: "DIGITAL_APPLIANCE" },
  { label: "패션의류",    value: "FASHION_CLOTHING" },
  { label: "패션잡화",    value: "FASHION_ACCESSORY" },
  { label: "뷰티",        value: "BEAUTY" },
  { label: "식품",        value: "FOOD" },
  { label: "생활건강",    value: "LIVING_HEALTH" },
  { label: "스포츠레저",  value: "SPORTS_LEISURE" },
  { label: "가구인테리어", value: "FURNITURE_INTERIOR" },
];

const CATEGORY_DB_KEY = {
  DIGITAL_APPLIANCE:  "디지털/가전",
  FASHION_CLOTHING:   "패션의류",
  FASHION_ACCESSORY:  "패션잡화",
  BEAUTY:             "화장품/미용",
  FOOD:               "식품",
  LIVING_HEALTH:      "생활/건강",
  SPORTS_LEISURE:     "스포츠/레저",
  FURNITURE_INTERIOR: "가구/인테리어",
};

export default function AdDetailPage({ adId, onNavigate }) {
  const [ad,           setAd]           = useState(null);
  const [productName,  setProductName]  = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [editMode,     setEditMode]     = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    adDetail({ adId })
      .then(data => {
        setAd(data);
        loadPreviewImage(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [adId]);

  async function loadPreviewImage(data) {
    try {
      if (data.targetType === "PRODUCT" && data.productId) {
        const product = await getProduct(data.productId);
        setPreviewImage(product?.imageUrl ?? null);
        setProductName(product?.name ?? product?.productName ?? `ID: ${data.productId}`);
      } else if (data.targetType === "CATEGORY" && data.category) {
        const dbKey = CATEGORY_DB_KEY[data.category] ?? data.category;
        const res = await getProducts({ page: 0, size: 20, category: dbKey });
        const items = res.content?.filter(p => p.imageUrl) ?? [];
        if (items.length > 0) setPreviewImage(items[Math.floor(Math.random() * items.length)].imageUrl);
      } else if (data.targetType === "KEYWORD" && data.keyword) {
        const res = await searchProducts({ query: data.keyword, display: 20, start: 1, sort: "sim" });
        const items = res.products?.filter(p => p.image) ?? [];
        if (items.length > 0) setPreviewImage(items[Math.floor(Math.random() * items.length)].image);
      }
    } catch {
      // 이미지 로드 실패 시 무시
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await adDelete({ adId });
      onNavigate("list");
    } catch (err) {
      setError(err.message);
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return (
    <div className="ac-main">
      <div style={{ padding: 40, textAlign: "center", fontSize: 13, color: "#9EA6B5" }}>불러오는 중...</div>
    </div>
  );

  if (error) return (
    <div className="ac-main">
      <div style={{ padding: 40, textAlign: "center", fontSize: 13, color: "#D94F4F" }}>{error}</div>
    </div>
  );

  // 수정 모드: AdCreatePage 재사용
  if (editMode) {
    return (
      <AdCreatePage
        ad={ad}
        onNavigate={(page) => {
          if (page === "list") onNavigate("list");
          else setEditMode(false);
        }}
      />
    );
  }

  const targetTypeLabel = TARGET_TYPE_DISPLAY_MAP[ad.targetType] ?? ad.targetType;
  const targetValue = ad.targetType === "PRODUCT"
    ? (productName ?? "불러오는 중...")
    : ad.targetType === "CATEGORY"
      ? (CATEGORY_OPTIONS.find(o => o.value === ad.category)?.label ?? ad.category)
      : ad.keyword;

  return (
    <div className="ac-main">
      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(33,33,33,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, width: 400, overflow: "hidden", border: "1px solid #E0E4E8" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "#F8F9FB", borderBottom: "1px solid #E0E4E8" }}>
              <span style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 700, fontSize: 15, color: "#121212" }}>광고 삭제</span>
              <button onClick={() => setShowDeleteModal(false)} style={{ width: 28, height: 28, background: "#E0E4E8", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11, color: "#80858A" }}>✕</button>
            </div>
            <div style={{ padding: "24px 20px" }}>
              <p style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 13, color: "#333", margin: "0 0 8px" }}><strong>"{ad.adName}"</strong> 광고를 삭제하시겠습니까?</p>
              <p style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 12, color: "#B82B2B", margin: 0 }}>삭제된 광고는 복구할 수 없습니다.</p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 20px", borderTop: "1px solid #E0E4E8" }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ height: 32, padding: "0 16px", background: "#fff", border: "1px solid #E0E4E8", borderRadius: 6, fontSize: 12, color: "#666", cursor: "pointer" }}>취소</button>
              <button onClick={handleDelete} disabled={deleting} style={{ height: 32, padding: "0 20px", background: "#B82B2B", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
                {deleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="ac-page-header">
        <div>
          <button
            onClick={() => onNavigate("list")}
            style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 12, color: "#4F6EF7", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 6 }}
          >
            ← 목록
          </button>
          <h1 className="ac-page-title">{ad.adName}</h1>
          <p className="ac-page-sub">광고 상세 정보</p>
        </div>
        <div className="ac-header-btns">
          <button className="ac-btn-cancel" onClick={() => setShowDeleteModal(true)} style={{ color: "#B82B2B", borderColor: "#F5B8B8" }}>삭제</button>
          <button className="ac-btn-submit" onClick={() => setEditMode(true)}>수정하기</button>
        </div>
      </div>

      <div className="ac-content">
        <div className="ac-left">
          <div className="ac-section">
            <h2 className="ac-section-title">광고 기본 정보</h2>
            <div className="ac-divider" />
            <div className="ac-field">
              <label className="ac-label">광고명</label>
              <span style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 13, color: "#121212", fontWeight: 500 }}>{ad.adName}</span>
            </div>
            <div className="ac-field">
              <label className="ac-label">등록일시</label>
              <span style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 13, color: "#121212" }}>
                {ad.createdAt?.substring(0, 19).replace("T", " ") ?? "–"}
              </span>
            </div>
          </div>

          <div className="ac-section">
            <h2 className="ac-section-title">타겟 설정</h2>
            <div className="ac-divider" />
            <div className="ac-field">
              <label className="ac-label">타겟 유형</label>
              <span style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 13, color: "#121212", fontWeight: 500 }}>{targetTypeLabel}</span>
            </div>
            <div className="ac-field">
              <label className="ac-label">타겟 값</label>
              <span style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 13, color: "#4F6EF7", fontWeight: 500, maxWidth: 320, whiteSpace: "normal", wordBreak: "break-word" }}>{targetValue ?? "–"}</span>
            </div>
          </div>
        </div>

        <div className="ac-right">
          <div className="ac-section">
            <h2 className="ac-section-title">광고 미리보기</h2>
            <div className="ac-divider" />
            <div className="ac-preview-card">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="광고 미리보기"
                  style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
                  onError={() => setPreviewImage(null)}
                />
              ) : (
                <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6, color: "#9EA6B5", fontSize: 12 }}>
                  <span>🖼</span>
                  <span>이미지 없음</span>
                </div>
              )}
            </div>

            <div className="ac-divider ac-divider-mid" />
            <p className="ac-summary-title">설정 요약</p>
            <div className="ac-summary-row">
              <span className="ac-summary-key">광고명</span>
              <span className="ac-summary-val">{ad.adName}</span>
            </div>
            <div className="ac-summary-row">
              <span className="ac-summary-key">타겟 유형</span>
              <span className="ac-summary-val">{targetTypeLabel}</span>
            </div>
            <div className="ac-summary-row">
              <span className="ac-summary-key">타겟 값</span>
              <span className="ac-summary-val" style={{ maxWidth: 220, whiteSpace: "normal", wordBreak: "break-word", textAlign: "right" }}>{targetValue ?? "–"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}