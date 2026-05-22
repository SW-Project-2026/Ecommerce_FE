import { useState } from "react";
import "./CouponCreatePage.css";
import { couponCreate, couponUpdate } from "../api/coupons";
import { withAutoRefresh } from "../utils/withAutoRefresh";

const DISCOUNT_TYPE_OPTIONS = [
  { label: "정률 할인 (%)", value: "RATE" },
  { label: "정액 할인 (원)", value: "FIXED" },
];

export default function CouponCreatePage({ onNavigate, coupon }) {
  const isEdit = !!coupon;

  const [form, setForm] = useState({
    name:          coupon?.name              ?? "",
    code:          coupon?.code              ?? "",
    discountType:  coupon?.discountType      ?? "RATE",
    discountValue: coupon?.discountAmount    != null ? String(coupon.discountAmount)    : "",
    minOrder:      coupon?.minOrderAmount    != null ? String(coupon.minOrderAmount)    : "",
    maxDiscount:   coupon?.maxDiscountAmount != null ? String(coupon.maxDiscountAmount) : "",
    validDays:     coupon?.expiredAt         != null ? String(coupon.expiredAt)         : "",
    quantity:      coupon?.issueLimit        != null ? String(coupon.issueLimit)        : "",
  });

  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(null);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const isRate = form.discountType === "RATE";

  const previewDiscount = form.discountValue
    ? `${form.discountValue}${isRate ? "%" : "원"}`
    : "10%";
  const previewName  = form.name     || "신규 가입 웰컴 쿠폰";
  const previewDays  = form.validDays ? `발급일로부터 ${form.validDays}일 유효` : "발급일로부터 7일 유효";

  const handleSubmit = async () => {
    if (!form.name.trim())          return setSaveError("쿠폰 이름을 입력해주세요.");
    if (!form.code.trim())          return setSaveError("쿠폰 코드를 입력해주세요.");
    if (!form.discountValue.trim()) return setSaveError("할인 값을 입력해주세요.");
    if (!form.validDays.trim())     return setSaveError("유효 기간을 입력해주세요.");
    if (!form.quantity.trim())      return setSaveError("발급 수량을 입력해주세요.");

    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        name:              form.name,
        code:              form.code,
        discountType:      form.discountType,
        discountAmount:    parseInt(form.discountValue, 10),
        minOrderAmount:    form.minOrder ? parseInt(form.minOrder, 10) : null,
        maxDiscountAmount: isRate && form.maxDiscount ? parseInt(form.maxDiscount, 10) : null,
        expiredAt:         parseInt(form.validDays, 10),
        issueLimit:        parseInt(form.quantity, 10),
      };

      if (isEdit) {
        await withAutoRefresh(() => couponUpdate({ couponId: coupon.couponId, ...payload }));
      } else {
        await withAutoRefresh(() => couponCreate(payload));
      }
      onNavigate("list");
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cc2-main">
      <div className="cc2-page-header">
        <div>
          <h1 className="cc2-page-title">{isEdit ? "쿠폰 수정" : "쿠폰 등록"}</h1>
          <p className="cc2-page-sub">{isEdit ? "쿠폰 정보를 수정합니다" : "새 쿠폰을 등록하고 발급 조건을 설정합니다"}</p>
        </div>
        <div className="cc2-header-btns">
          <button className="cc2-btn-cancel" onClick={() => onNavigate("list")} disabled={saving}>취소</button>
          <button className="cc2-btn-submit" onClick={handleSubmit} disabled={saving}>
            {saving ? (isEdit ? "수정 중..." : "등록 중...") : (isEdit ? "수정하기" : "쿠폰 등록하기")}
          </button>
        </div>
      </div>

      <div className="cc2-content">
        <div className="cc2-left">

          <div className="cc2-section">
            <h2 className="cc2-section-title">쿠폰 기본 정보</h2>
            <div className="cc2-divider" />
            <div className="cc2-field">
              <label className="cc2-label">쿠폰 이름 *</label>
              <input className="cc2-input cc2-input-wide" placeholder="예) 신규 가입 웰컴 쿠폰" value={form.name} onChange={e => update("name", e.target.value)} />
            </div>
            <div className="cc2-field">
              <label className="cc2-label">쿠폰 코드 *</label>
              <input className="cc2-input cc2-input-wide" placeholder="예) WELCOME25 (영문/숫자)" value={form.code} onChange={e => update("code", e.target.value.toUpperCase())} />
            </div>
            <div className="cc2-field">
              <label className="cc2-label">할인 유형 *</label>
              <div className="cc2-select-wrap cc2-input-wide">
                <select className="cc2-select" value={form.discountType} onChange={e => update("discountType", e.target.value)}>
                  {DISCOUNT_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div className="cc2-field">
              <label className="cc2-label">할인 값 *</label>
              <div className="cc2-inline-group">
                <input className="cc2-input cc2-input-sm" type="number" min="0" value={form.discountValue} onChange={e => update("discountValue", e.target.value)} placeholder="10" />
                <span className="cc2-unit">{isRate ? "%" : "원"}</span>
              </div>
            </div>
            <div className="cc2-field">
              <label className="cc2-label">최소 주문 금액</label>
              <div className="cc2-inline-group">
                <input className="cc2-input cc2-input-wide" type="number" min="0" value={form.minOrder} onChange={e => update("minOrder", e.target.value)} placeholder="30000" />
                <span className="cc2-unit">원 이상</span>
              </div>
            </div>
            {isRate && (
              <div className="cc2-field">
                <label className="cc2-label">최대 할인 금액</label>
                <div className="cc2-inline-group">
                  <input className="cc2-input cc2-input-wide" type="number" min="0" value={form.maxDiscount} onChange={e => update("maxDiscount", e.target.value)} placeholder="5000" />
                  <span className="cc2-unit">원 한도</span>
                </div>
              </div>
            )}
          </div>

          <div className="cc2-section">
            <h2 className="cc2-section-title">발급 설정</h2>
            <div className="cc2-divider" />
            <div className="cc2-field">
              <label className="cc2-label">유효 기간 *</label>
              <div className="cc2-inline-group">
                <input className="cc2-input cc2-input-sm" type="number" min="1" value={form.validDays} onChange={e => update("validDays", e.target.value)} placeholder="7" />
                <span className="cc2-unit">일 (발급일 기준)</span>
              </div>
            </div>
            <div className="cc2-field">
              <label className="cc2-label">발급 수량 *</label>
              <div className="cc2-inline-group">
                <input className="cc2-input cc2-input-sm" type="number" min="1" value={form.quantity} onChange={e => update("quantity", e.target.value)} placeholder="1000" />
                <span className="cc2-unit">건</span>
              </div>
              <p style={{ fontSize: 11, color: "#9EA6B5", marginTop: 4 }}>* 전체 고객에 대한 최대 발급 수량입니다</p>
            </div>
          </div>

          {saveError && <div style={{ color: "red", fontSize: 13, marginTop: 8 }}>{saveError}</div>}
        </div>

        {/* 오른쪽: 미리보기 */}
        <div className="cc2-right">
          <div className="cc2-section">
            <h2 className="cc2-section-title">쿠폰 미리보기</h2>
            <div className="cc2-divider" />

            {/* 쿠폰 카드: 좌측 그라디언트 + 우측 흰색 */}
            <div className="cc2-coupon-card">
              {/* 좌측: 그라디언트 영역 */}
              <div className="cc2-coupon-gradient">
                <div className="cc2-coupon-body">
                  <p className="cc2-coupon-value">{previewDiscount}</p>
                  <p className="cc2-coupon-type">할인</p>
                </div>
                <div className="cc2-coupon-footer">
                  <p className="cc2-coupon-name">{previewName}</p>
                  <p className="cc2-coupon-validity">{previewDays}</p>
                </div>
              </div>

              {/* 우측: 흰색 다운로드 영역 */}
              <div className="cc2-coupon-white">
                <div className="cc2-notch cc2-notch-top" />
                <div className="cc2-download-circle">
                  <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                    <path d="M8 0v9M8 9l-3.5-3.5M8 9l3.5-3.5M1 11.5h14" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="cc2-notch cc2-notch-bottom" />
              </div>
            </div>

            <div className="cc2-divider cc2-divider-mid" />
            <p className="cc2-summary-title">조건 요약</p>
            <div className="cc2-summary-row">
              <span className="cc2-summary-key">최소 주문</span>
              <span className="cc2-summary-val">{form.minOrder ? `${Number(form.minOrder).toLocaleString()}원 이상` : "–"}</span>
            </div>
            {isRate && (
              <div className="cc2-summary-row">
                <span className="cc2-summary-key">최대 할인</span>
                <span className="cc2-summary-val">{form.maxDiscount ? `${Number(form.maxDiscount).toLocaleString()}원 한도` : "–"}</span>
              </div>
            )}
            <div className="cc2-summary-row">
              <span className="cc2-summary-key">유효 기간</span>
              <span className="cc2-summary-val">{form.validDays ? `${form.validDays}일 (발급일 기준)` : "–"}</span>
            </div>
            <div className="cc2-summary-row">
              <span className="cc2-summary-key">발급 수량</span>
              <span className="cc2-summary-val">{form.quantity ? `${Number(form.quantity).toLocaleString()}건` : "–"}</span>
            </div>

            <div className="cc2-notice">
              <p>* 표시 항목은 필수 입력입니다</p>
              <p>쿠폰 코드는 중복 불가 · 영문 대문자/숫자만 허용</p>
              {!isEdit && <p>등록 후 발급 방식은 변경 불가합니다</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}