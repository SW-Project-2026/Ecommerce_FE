import { useState } from "react";
import { couponDownload } from "../api/coupons";
import { couponReceived } from "../api/snippets";

export default function CouponPopup({ coupon, onClose, onDismiss, userId = null, isLoggedIn = false, onNavigate }) {
  const [downloaded, setDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const info = coupon ?? {};

  const discountDisplay = info.discountType === "RATE"
    ? <>{info.discountAmount}<span style={{ fontSize: 28, fontWeight: 500 }}> % 할인</span></>
    : <>{info.discountAmount?.toLocaleString()}<span style={{ fontSize: 28, fontWeight: 500 }}>원 할인</span></>

  const handleDownload = async () => {
    if (downloaded || downloading) return;

    if (!isLoggedIn) {
      try {
        sessionStorage.setItem('pendingCouponPopup', JSON.stringify(coupon));
      } catch {}
      onClose?.()
      onNavigate?.('register');
      return;
    }

    if (!coupon?.couponId) return;
    setDownloading(true);
    try {
      const downloadData = await couponDownload({ couponId: coupon.couponId });
      const amount = info.discountType === 'RATE'
        ? `${info.discountAmount}%`
        : `${info.discountAmount?.toLocaleString()}원`
      couponReceived({
        couponCode:     downloadData?.code ?? null,
        discountAmount: amount,
        expiryDate:     downloadData?.expiredAt ?? null,
        userId,
      }).catch(() => {})
      setDownloaded(true);
    } catch (err) {
      alert(err.message ?? "쿠폰 다운로드에 실패했습니다.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(80,79,88,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: 424, borderRadius: 16, overflow: "hidden",
        background: "#DFE3EA",
        boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
        display: "flex", flexDirection: "column",
        position: "relative",
      }}>
        <div style={{
          position: "absolute",
          width: 548, height: 317,
          background: "#F4F4F4",
          transform: "rotate(-20deg)",
          top: -120, left: -100,
          zIndex: 0,
        }} />

        <div style={{ padding: "40px 41px 28px", position: "relative", zIndex: 1 }}>
          <div style={{
            width: 343, height: 171,
            display: "flex", borderRadius: 10, overflow: "hidden",
            boxShadow: "0px 4px 8px -3px rgba(35,39,47,0.12), 0px 2px 4px -3px rgba(35,39,47,0.04)",
          }}>
            <div style={{
              flex: 1,
              background: "linear-gradient(43.84deg, #1C2E5C 7.19%, #3B61C2 75.51%)",
              display: "flex", flexDirection: "column", justifyContent: "flex-end",
              padding: "12px", gap: 4,
            }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 44, fontWeight: 700, color: "#FFFFFF", lineHeight: 1 }}>
                {discountDisplay}
              </div>
              <div style={{ fontFamily: "'Manrope','Inter',sans-serif", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>
                {info.couponName ?? "쿠폰"}
              </div>
              <div style={{ fontFamily: "'Manrope','Inter',sans-serif", fontSize: 10, fontWeight: 400, color: "rgba(255,255,255,0.6)" }}>
                발급일로부터 7일 유효
              </div>
            </div>

            <div style={{
              width: 72, background: "#FFFFFF",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, position: "relative",
            }}>
              <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", width: 20, height: 20, borderRadius: "50%", background: "#DFE3EA" }} />
              <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", width: 20, height: 20, borderRadius: "50%", background: "#DFE3EA" }} />
              <div
                onClick={handleDownload}
                style={{
                  width: 33, height: 33, borderRadius: "50%",
                  background: downloaded ? "#4CAF50" : downloading ? "#7a9bd4" : "#395DBA",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: downloaded || downloading ? "default" : "pointer",
                  transition: "background 0.2s",
                }}
              >
                {downloaded ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 24, width: 343, height: 94,
            display: "flex", flexDirection: "column", justifyContent: "center",
            alignItems: "center", padding: "0 26px",
          }}>
            {!isLoggedIn ? (
              <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, color: "#3B61C2", textAlign: "center" }}>
                회원가입 하시고 쿠폰 받으세요!
              </div>
            ) : (
              <>
                <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, color: "#3B61C2", marginBottom: 4, textAlign: "center" }}>
                  {info.minOrderAmount?.toLocaleString() ?? "–"}원 이상 구매 시
                </div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, color: "#21366B", textAlign: "center" }}>
                  {info.discountType === "RATE" && !info.maxDiscountAmount ? (
                    <>최대 한도 없이 <span style={{ fontWeight: 800, color: "#3B61C2" }}>{info.discountAmount}%</span> 할인받으세요!</>
                  ) : (
                    <>최대 <span style={{ fontWeight: 800, color: "#3B61C2" }}>
                      {info.discountType === "RATE"
                        ? `${info.maxDiscountAmount?.toLocaleString()}원`
                        : `${info.discountAmount?.toLocaleString() ?? "–"}원`}
                    </span> 할인받으세요!</>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ display: "flex", borderTop: "1px solid #CBCBCB", background: "#FFFFFF" }}>
          <button
            onClick={onDismiss}
            style={{ flex: 1, height: 53, border: "none", background: "transparent", fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#909090", cursor: "pointer" }}
          >
            다시 보지 않기
          </button>
          <div style={{ width: 1, background: "#CBCBCB" }} />
          <button
            onClick={onClose}
            style={{ flex: 1, height: 53, border: "none", background: "transparent", fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#909090", cursor: "pointer" }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}