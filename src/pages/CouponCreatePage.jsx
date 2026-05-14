import { useState } from "react";
import "./CouponCreatePage.css";
import { couponCreate, couponUpdate } from "../api/coupons";

const DISCOUNT_TYPE_OPTIONS = [
  { label: "정률 할인 (%)", value: "RATE" },
  { label: "정액 할인 (원)", value: "FIXED" },
];

const ISSUANCE_METHOD_OPTIONS = [
  { label: "자동 지급", value: "AUTO" },
  { label: "다운로드",  value: "DOWNLOAD" },
];

// coupon prop이 있으면 수정 모드, 없으면 생성 모드
export default function CouponCreatePage({ onNavigate, coupon }) {
  const isEdit = !!coupon;

  const [form, setForm] = useState({
    name:           coupon?.name          ?? "",
    code:           coupon?.code          ?? "",
    discountType:   coupon?.discountType  ?? "RATE",
    discountValue:  coupon?.discountAmount != null ? String(coupon.discountAmount) : "",
    minOrder:       coupon?.minOrderAmount != null ? String(coupon.minOrderAmount) : "",
    maxDiscount:    coupon?.maxDiscountAmount != null ? String(coupon.maxDiscountAmount) : "",
    validDays:      coupon?.expiredAt     != null ? String(coupon.expiredAt) : "",
    issuanceMethod: coupon?.issuanceMethod ?? "AUTO",
    quantity:       coupon?.issueLimit    != null ? String(coupon.issueLimit) : "",
  });

  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(null);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const previewDiscount = form.discountValue
    ? `${form.discountValue}${form.discountType === "RATE" ? "%" : "원"}`
    : "–";
  const previewName = form.name || "신규 가입 웰컴 쿠폰";
  const previewCode = form.code || "WELCOME25";

  const handleSubmit = async () => {
    if (!form.name.trim())          return setSaveError("쿠폰 이름을 입력해주세요.");
    if (!form.code.trim())          return setSaveError("쿠폰 코드를 입력해주세요.");
    if (!form.discountValue.trim()) return setSaveError("할인 값을 입력해주세요.");
    if (!form.validDays.trim())     return setSaveError("유효 기간을 입력해주세요.");

    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        name:              form.name,
        code:              form.code,
        discountType:      form.discountType,
        discountAmount:    parseInt(form.discountValue, 10),
        minOrderAmount:    form.minOrder    ? parseInt(form.minOrder, 10)    : null,
        maxDiscountAmount: form.maxDiscount ? parseInt(form.maxDiscount, 10) : null,
        expiredAt:         parseInt(form.validDays, 10),
        issuanceMethod:    form.issuanceMethod,
        issueLimit:        form.quantity ? parseInt(form.quantity, 10) : null,
      };

      if (isEdit) {
        await couponUpdate({ couponId: coupon.couponId, ...payload });
      } else {
        await couponCreate(payload);
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
              <input
                className="cc2-input cc2-input-wide"
                placeholder="예) 신규 가입 웰컴 쿠폰"
                value={form.name}
                onChange={e => update("name", e.target.value)}
              />
            </div>

            <div className="cc2-field">
              <label className="cc2-label">쿠폰 코드 *</label>
              <input
                className="cc2-input cc2-input-wide"
                placeholder="예) WELCOME25 (영문/숫자)"
                value={form.code}
                onChange={e => update("code", e.target.value.toUpperCase())}
              />
            </div>

            <div className="cc2-field">
              <label className="cc2-label">할인 유형 *</label>
              <div className="cc2-select-wrap cc2-input-wide">
                <select
                  className="cc2-select"
                  value={form.discountType}
                  onChange={e => update("discountType", e.target.value)}
                >
                  {DISCOUNT_TYPE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="cc2-field">
              <label className="cc2-label">할인 값 *</label>
              <div className="cc2-inline-group">
                <input
                  className="cc2-input cc2-input-sm"
                  type="number"
                  min="0"
                  value={form.discountValue}
                  onChange={e => update("discountValue", e.target.value)}
                  placeholder="10"
                />
                <span className="cc2-unit">{form.discountType === "RATE" ? "%" : "원"}</span>
              </div>
            </div>

            <div className="cc2-field">
              <label className="cc2-label">최소 주문 금액</label>
              <div className="cc2-inline-group">
                <input
                  className="cc2-input cc2-input-wide"
                  type="number"
                  min="0"
                  value={form.minOrder}
                  onChange={e => update("minOrder", e.target.value)}
                  placeholder="30000"
                />
                <span className="cc2-unit">원 이상</span>
              </div>
            </div>

            <div className="cc2-field">
              <label className="cc2-label">최대 할인 금액</label>
              <div className="cc2-inline-group">
                <input
                  className="cc2-input cc2-input-wide"
                  type="number"
                  min="0"
                  value={form.maxDiscount}
                  onChange={e => update("maxDiscount", e.target.value)}
                  placeholder="5000"
                />
                <span className="cc2-unit">원 한도</span>
              </div>
            </div>
          </div>

          <div className="cc2-section">
            <h2 className="cc2-section-title">발급 설정</h2>
            <div className="cc2-divider" />

            <div className="cc2-field">
              <label className="cc2-label">유효 기간 *</label>
              <div className="cc2-inline-group">
                <input
                  className="cc2-input cc2-input-sm"
                  type="number"
                  min="1"
                  value={form.validDays}
                  onChange={e => update("validDays", e.target.value)}
                  placeholder="7"
                />
                <span className="cc2-unit">일 (발급일 기준)</span>
              </div>
            </div>

            <div className="cc2-field">
              <label className="cc2-label">발급 방식 *</label>
              <div className="cc2-radio-group">
                {ISSUANCE_METHOD_OPTIONS.map(opt => (
                  <label key={opt.value} className="cc2-radio-label">
                    <input
                      type="radio"
                      name="issuanceMethod"
                      checked={form.issuanceMethod === opt.value}
                      onChange={() => update("issuanceMethod", opt.value)}
                      className="cc2-radio"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="cc2-field">
              <label className="cc2-label">발급 수량</label>
              <div className="cc2-inline-group">
                <input
                  className="cc2-input cc2-input-sm"
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={e => update("quantity", e.target.value)}
                  placeholder="제한 없음"
                />
                <span className="cc2-unit">건 (0 = 무제한)</span>
              </div>
              <p style={{ fontSize: 11, color: "#FF6B6B", marginTop: 4 }}>
                * 1인당 최대 발급 수량입니다
              </p>
            </div>
          </div>

          {saveError && <div style={{ color: "red", fontSize: 13, marginTop: 8 }}>{saveError}</div>}
        </div>

        <div className="cc2-right">
          <div className="cc2-section">
            <h2 className="cc2-section-title">쿠폰 미리보기</h2>
            <div className="cc2-divider" />

            <div className="cc2-coupon-card">
              <div className="cc2-coupon-left">
                <p className="cc2-coupon-value">{previewDiscount}</p>
                <p className="cc2-coupon-type">할인</p>
                <p className="cc2-coupon-name">{previewName}</p>
              </div>
              <div className="cc2-coupon-right">
                <div className="cc2-coupon-code-box">
                  <span className="cc2-coupon-code">{previewCode}</span>
                </div>
              </div>
            </div>

            <div className="cc2-divider cc2-divider-mid" />
            <p className="cc2-summary-title">조건 요약</p>
            <div className="cc2-summary-row">
              <span className="cc2-summary-key">최소 주문</span>
              <span className="cc2-summary-val">{form.minOrder ? `${Number(form.minOrder).toLocaleString()}원 이상` : "–"}</span>
            </div>
            <div className="cc2-summary-row">
              <span className="cc2-summary-key">최대 할인</span>
              <span className="cc2-summary-val">{form.maxDiscount ? `${Number(form.maxDiscount).toLocaleString()}원 한도` : "–"}</span>
            </div>
            <div className="cc2-summary-row">
              <span className="cc2-summary-key">유효 기간</span>
              <span className="cc2-summary-val">{form.validDays ? `${form.validDays}일 (발급일 기준)` : "–"}</span>
            </div>
            <div className="cc2-summary-row">
              <span className="cc2-summary-key">발급 방식</span>
              <span className="cc2-summary-val">
                {ISSUANCE_METHOD_OPTIONS.find(o => o.value === form.issuanceMethod)?.label ?? "–"}
              </span>
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