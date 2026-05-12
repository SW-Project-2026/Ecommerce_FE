import { useState } from "react";
import "./CouponCreatePage.css";

export default function CouponCreatePage({ onNavigate }) {
  const [form, setForm] = useState({
    name: "",
    code: "",
    discountType: "정률 할인 (%)",
    discountValue: "",
    minOrder: "",
    maxDiscount: "",
    validDays: "",
    issueType: "자동 지급",
    quantity: "",
  });

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const previewDiscount = form.discountValue
    ? `${form.discountValue}${form.discountType.includes("%") ? "%" : "원"}`
    : "–";
  const previewName = form.name || "신규 가입 웰컴 쿠폰";
  const previewCode = form.code || "WELCOME25";

  return (
    <div className="cc2-main">
      {/* ── 흰색 Page Header ── */}
      <div className="cc2-page-header">
        <div>
          <h1 className="cc2-page-title">쿠폰 등록</h1>
          <p className="cc2-page-sub">새 쿠폰을 등록하고 발급 조건을 설정합니다</p>
        </div>
        <div className="cc2-header-btns">
          <button className="cc2-btn-cancel" onClick={() => onNavigate("list")}>취소</button>
          <button className="cc2-btn-submit">쿠폰 등록하기</button>
        </div>
      </div>

      {/* ── 회색 콘텐츠 ── */}
      <div className="cc2-content">
        <div className="cc2-left">

          {/* 쿠폰 기본 정보 */}
          <div className="cc2-section">
            <h2 className="cc2-section-title">쿠폰 기본 정보</h2>
            <div className="cc2-divider" />

            <div className="cc2-field">
              <label className="cc2-label">쿠폰 이름 *</label>
              <input
                className="cc2-input cc2-input-wide"
                placeholder="예) 신규 가입 웰컴 쿠폰"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>

            <div className="cc2-field">
              <label className="cc2-label">쿠폰 코드 *</label>
              <input
                className="cc2-input cc2-input-wide"
                placeholder="예) WELCOME25 (영문/숫자)"
                value={form.code}
                onChange={(e) => update("code", e.target.value.toUpperCase())}
              />
            </div>

            <div className="cc2-field">
              <label className="cc2-label">할인 유형 *</label>
              <div className="cc2-select-wrap cc2-input-wide">
                <select
                  className="cc2-select"
                  value={form.discountType}
                  onChange={(e) => update("discountType", e.target.value)}
                >
                  <option>정률 할인 (%)</option>
                  <option>정액 할인 (원)</option>
                </select>
              </div>
            </div>

            <div className="cc2-field">
              <label className="cc2-label">할인 값 *</label>
              <div className="cc2-inline-group">
                <input
                  className="cc2-input cc2-input-sm"
                  value={form.discountValue}
                  onChange={(e) => update("discountValue", e.target.value)}
                  placeholder="10"
                />
                <span className="cc2-unit">{form.discountType.includes("%") ? "%" : "원"}</span>
              </div>
            </div>

            <div className="cc2-field">
              <label className="cc2-label">최소 주문 금액</label>
              <div className="cc2-inline-group">
                <input
                  className="cc2-input cc2-input-wide"
                  value={form.minOrder}
                  onChange={(e) => update("minOrder", e.target.value)}
                  placeholder="30,000"
                />
                <span className="cc2-unit">원 이상</span>
              </div>
            </div>

            <div className="cc2-field">
              <label className="cc2-label">최대 할인 금액</label>
              <div className="cc2-inline-group">
                <input
                  className="cc2-input cc2-input-wide"
                  value={form.maxDiscount}
                  onChange={(e) => update("maxDiscount", e.target.value)}
                  placeholder="5,000"
                />
                <span className="cc2-unit">원 한도</span>
              </div>
            </div>
          </div>

          {/* 발급 설정 */}
          <div className="cc2-section">
            <h2 className="cc2-section-title">발급 설정</h2>
            <div className="cc2-divider" />

            <div className="cc2-field">
              <label className="cc2-label">유효 기간 *</label>
              <div className="cc2-inline-group">
                <input
                  className="cc2-input cc2-input-sm"
                  value={form.validDays}
                  onChange={(e) => update("validDays", e.target.value)}
                  placeholder="7"
                />
                <span className="cc2-unit">일 (발급일 기준)</span>
              </div>
            </div>

            <div className="cc2-field">
              <label className="cc2-label">발급 방식 *</label>
              <div className="cc2-radio-group">
                {["자동 지급", "다운로드"].map((opt) => (
                  <label key={opt} className="cc2-radio-label">
                    <input
                      type="radio"
                      name="issueType"
                      checked={form.issueType === opt}
                      onChange={() => update("issueType", opt)}
                      className="cc2-radio"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div className="cc2-field">
              <label className="cc2-label">발급 수량</label>
              <div className="cc2-inline-group">
                <input
                  className="cc2-input cc2-input-sm"
                  value={form.quantity}
                  onChange={(e) => update("quantity", e.target.value)}
                  placeholder="제한 없음"
                />
                <span className="cc2-unit">건 (0 = 무제한)</span>
              </div>
              <p style={{ fontSize: 11, color: "#FF6B6B", marginTop: 4 }}>
                * 1인당 최대 발급 수량입니다
              </p>
            </div>
          </div>
        </div>

        {/* ── 오른쪽: 미리보기 ── */}
        <div className="cc2-right">
          <div className="cc2-section">
            <h2 className="cc2-section-title">쿠폰 미리보기</h2>
            <div className="cc2-divider" />

            {/* 쿠폰 카드 */}
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

            {/* 조건 요약 */}
            <div className="cc2-divider cc2-divider-mid" />
            <p className="cc2-summary-title">조건 요약</p>
            <div className="cc2-summary-row">
              <span className="cc2-summary-key">최소 주문</span>
              <span className="cc2-summary-val">{form.minOrder ? `${form.minOrder}원 이상` : "–"}</span>
            </div>
            <div className="cc2-summary-row">
              <span className="cc2-summary-key">최대 할인</span>
              <span className="cc2-summary-val">{form.maxDiscount ? `${form.maxDiscount}원 한도` : "–"}</span>
            </div>
            <div className="cc2-summary-row">
              <span className="cc2-summary-key">유효 기간</span>
              <span className="cc2-summary-val">{form.validDays ? `${form.validDays}일 (발급일 기준)` : "–"}</span>
            </div>
            <div className="cc2-summary-row">
              <span className="cc2-summary-key">발급 방식</span>
              <span className="cc2-summary-val">{form.issueType}</span>
            </div>

            {/* 안내 박스 */}
            <div className="cc2-notice">
              <p>* 표시 항목은 필수 입력입니다</p>
              <p>쿠폰 코드는 중복 불가 · 영문 대문자/숫자만 허용</p>
              <p>등록 후 발급 방식은 변경 불가합니다</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}