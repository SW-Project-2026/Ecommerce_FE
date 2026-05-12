import { useState, useEffect } from "react";
import "./AdCreatePage.css";
import { getProduct, getProducts, searchProducts } from "../api/products";

const AD_TARGET_TYPES = ["상품", "카테고리", "키워드"];

const CATEGORY_OPTIONS = [
  "가전/디지털", "패션", "뷰티", "식품", "생활용품", "스포츠"
];

const CATEGORY_DB_KEY = {
  "가전/디지털": "디지털/가전",
  "패션":        "패션의류",
  "뷰티":        "화장품/미용",
  "식품":        "식품",
  "생활용품":    "생활/건강",
  "스포츠":      "스포츠/레저",
};

export default function AdCreatePage({ onNavigate }) {
  const [form, setForm] = useState({
    name:        "",
    targetType:  "상품",
    productId:   "",
    category:    "",
    keyword:     "",
  });

  const [previewImage,   setPreviewImage]   = useState(null);  // 미리보기 이미지 URL
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError,   setPreviewError]   = useState(null);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleTargetTypeChange = (type) => {
    setForm(p => ({ ...p, targetType: type, productId: "", category: "", keyword: "" }));
    setPreviewImage(null);
    setPreviewError(null);
  };

  // ── 상품 ID로 이미지 조회 ──
  const handleProductIdBlur = async () => {
    if (!form.productId.trim()) return;
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const product = await getProduct(form.productId);
      setPreviewImage(product?.imageUrl ?? null);
      if (!product?.imageUrl) setPreviewError("이미지가 없는 상품입니다.");
    } catch {
      setPreviewImage(null);
      setPreviewError("상품을 찾을 수 없습니다.");
    } finally {
      setPreviewLoading(false);
    }
  };

  // ── 카테고리 변경 시 랜덤 이미지 조회 ──
  useEffect(() => {
    if (!form.category) { setPreviewImage(null); return; }
    setPreviewLoading(true);
    setPreviewError(null);
    const dbKey = CATEGORY_DB_KEY[form.category] ?? form.category;
    getProducts({ page: 0, size: 20, category: dbKey })
      .then(data => {
        const items = data.content?.filter(p => p.imageUrl) ?? [];
        if (items.length === 0) { setPreviewError("이미지가 있는 상품이 없습니다."); return; }
        const random = items[Math.floor(Math.random() * items.length)];
        setPreviewImage(random.imageUrl);
      })
      .catch(() => setPreviewError("이미지를 불러올 수 없습니다."))
      .finally(() => setPreviewLoading(false));
  }, [form.category]);

  // ── 키워드 입력 후 blur 시 랜덤 이미지 조회 ──
  const handleKeywordBlur = async () => {
    if (!form.keyword.trim()) return;
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const data = await searchProducts({ query: form.keyword, display: 20, start: 1, sort: "sim" });
      const items = data.products?.filter(p => p.image) ?? [];
      if (items.length === 0) { setPreviewError("관련 상품 이미지가 없습니다."); return; }
      const random = items[Math.floor(Math.random() * items.length)];
      setPreviewImage(random.image);
    } catch {
      setPreviewError("이미지를 불러올 수 없습니다.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const previewTarget = () => {
    if (form.targetType === "상품")    return form.productId ? `상품 ID: ${form.productId}` : "–";
    if (form.targetType === "카테고리") return form.category || "–";
    if (form.targetType === "키워드")  return form.keyword   || "–";
    return "–";
  };

  const hintStyle = {
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 11,
    color: "#9EA6B5",
    margin: "6px 0 0 0",
    lineHeight: 1.5,
  };

  return (
    <div className="ac-main">
      {/* ── Page Header ── */}
      <div className="ac-page-header">
        <div>
          <h1 className="ac-page-title">광고 등록</h1>
          <p className="ac-page-sub">새 광고를 등록합니다</p>
        </div>
        <div className="ac-header-btns">
          <button className="ac-btn-cancel" onClick={() => onNavigate("list")}>취소</button>
          <button className="ac-btn-submit">광고 등록하기</button>
        </div>
      </div>

      {/* ── 콘텐츠 ── */}
      <div className="ac-content">
        <div className="ac-left">

          {/* 광고 기본 정보 */}
          <div className="ac-section">
            <h2 className="ac-section-title">광고 기본 정보</h2>
            <div className="ac-divider" />
            <div className="ac-field">
              <label className="ac-label">광고명 *</label>
              <input
                className="ac-input ac-input-wide"
                placeholder="예) 출근시간 맞춤광고"
                value={form.name}
                onChange={e => update("name", e.target.value)}
              />
            </div>
          </div>

          {/* 광고 타겟 설정 */}
          <div className="ac-section">
            <h2 className="ac-section-title">타겟 설정</h2>
            <div className="ac-divider" />

            <div className="ac-field">
              <label className="ac-label">타겟 유형 *</label>
              <div className="ac-type-btns">
                {AD_TARGET_TYPES.map(t => (
                  <button
                    key={t}
                    className={`ac-type-btn ${form.targetType === t ? "ac-type-btn-active" : ""}`}
                    onClick={() => handleTargetTypeChange(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* 상품 */}
            {form.targetType === "상품" && (
              <div className="ac-field ac-field-col">
                <label className="ac-label">상품 ID *</label>
                <input
                  className="ac-input ac-input-wide"
                  placeholder="예) 1023"
                  value={form.productId}
                  onChange={e => update("productId", e.target.value)}
                  onBlur={handleProductIdBlur}
                />
                <p style={hintStyle}>상품 ID 입력 후 포커스를 벗어나면 이미지가 미리보기에 표시됩니다.</p>
              </div>
            )}

            {/* 카테고리 */}
            {form.targetType === "카테고리" && (
              <div className="ac-field ac-field-col">
                <label className="ac-label">카테고리 *</label>
                <div className="ac-select-wrap ac-input-wide">
                  <select
                    className="ac-select"
                    value={form.category}
                    onChange={e => update("category", e.target.value)}
                  >
                    <option value="">선택하세요</option>
                    {CATEGORY_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <p style={hintStyle}>해당 카테고리 상품 중 랜덤으로 이미지가 표시됩니다.</p>
              </div>
            )}

            {/* 키워드 */}
            {form.targetType === "키워드" && (
              <div className="ac-field ac-field-col">
                <label className="ac-label">키워드 *</label>
                <input
                  className="ac-input ac-input-wide"
                  placeholder="예) 축구화"
                  value={form.keyword}
                  onChange={e => update("keyword", e.target.value)}
                  onBlur={handleKeywordBlur}
                />
                <p style={hintStyle}>키워드 입력 후 포커스를 벗어나면 관련 상품 이미지가 랜덤으로 표시됩니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── 오른쪽: 미리보기 ── */}
        <div className="ac-right">
          <div className="ac-section">
            <h2 className="ac-section-title">광고 미리보기</h2>
            <div className="ac-divider" />

            {/* 이미지 미리보기 */}
            <div className="ac-preview-card">
              {previewLoading ? (
                <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "#9EA6B5", fontSize: 12 }}>
                  이미지 불러오는 중...
                </div>
              ) : previewImage ? (
                <img
                  src={previewImage}
                  alt="광고 미리보기"
                  style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
                  onError={() => { setPreviewImage(null); setPreviewError("이미지를 불러올 수 없습니다."); }}
                />
              ) : (
                <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6, color: "#9EA6B5", fontSize: 12 }}>
                  <span>🖼</span>
                  <span>{previewError ?? "상품 이미지 자동 표시"}</span>
                </div>
              )}
            </div>

            {/* 조건 요약 */}
            <div className="ac-divider ac-divider-mid" />
            <p className="ac-summary-title">설정 요약</p>
            <div className="ac-summary-row">
              <span className="ac-summary-key">광고명</span>
              <span className="ac-summary-val">{form.name || "–"}</span>
            </div>
            <div className="ac-summary-row">
              <span className="ac-summary-key">타겟 유형</span>
              <span className="ac-summary-val">{form.targetType}</span>
            </div>
            <div className="ac-summary-row">
              <span className="ac-summary-key">타겟 값</span>
              <span className="ac-summary-val">{previewTarget()}</span>
            </div>

            <div className="ac-notice">
              <p>* 표시 항목은 필수 입력입니다</p>
              <p>이미지는 타겟 상품에 맞게 자동 표시됩니다</p>
              <p>키워드/카테고리 광고는 노출 시점마다 다른 상품이 표시됩니다</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}