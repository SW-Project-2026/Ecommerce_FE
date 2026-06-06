import { useState, useEffect } from "react";
import { couponClaim } from "../api/coupons";

export default function CouponClaimPage() {
  const [claimed,    setClaimed]    = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [couponData, setCouponData] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("token");

    if (!token) {
      setError("유효하지 않은 링크입니다.");
      setLoading(false);
      return;
    }

    couponClaim({ token })
      .then(data => {
        setCouponData(data);
        setClaimed(true);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const couponName     = couponData?.couponName     ?? "할인 쿠폰";
  const discountAmount = couponData?.discountAmount ?? null;
  const discountType   = couponData?.discountType   ?? null;
  const minOrder       = couponData?.minOrderAmount ?? null;
  const expiredAt      = couponData?.expiredAt      ?? null;

  const discountDisplay = discountAmount
    ? discountType === "RATE"
      ? <>{discountAmount}<span style={{ fontSize: 24, fontWeight: 500 }}>%</span></>
      : <>{discountAmount.toLocaleString()}<span style={{ fontSize: 24, fontWeight: 500 }}>원</span></>
    : <>3,000<span style={{ fontSize: 24, fontWeight: 500 }}>원</span></>

  const minOrderText = minOrder ? `${minOrder.toLocaleString()}원 이상 주문 시` : "5만원 이상 주문"
  const expiredText  = expiredAt ? `유효기간 ${expiredAt}까지` : "유효기간 내 사용 가능"

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F6F7FA", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 14, color: "#9EA6B5" }}>쿠폰을 불러오는 중...</p>
    </div>
  );

  if (error && !claimed) return (
    <div style={{ minHeight: "100vh", background: "#F6F7FA", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 40 }}>😥</div>
      <p style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 16, fontWeight: 700, color: "#121212" }}>쿠폰을 받을 수 없어요</p>
      <p style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 13, color: "#9EA6B5" }}>{error}</p>
    </div>
  );

  if (claimed) return (
    <div style={{ minHeight: "100vh", background: "#F6F7FA", fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* Hero 배너 (성공) */}
      <div style={{
        width: "100%", height: 280,
        background: "linear-gradient(97.92deg, #436A80 0.29%, #1C2E5C 84.81%)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 88, height: 88, borderRadius: "50%",
          background: "rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 44, fontWeight: 700, color: "#FFFFFF", lineHeight: 1 }}>✓</span>
        </div>
      </div>

      {/* 성공 카드 */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: -60, padding: "0 20px", marginBottom: 32 }}>
        <div style={{
          width: 640, background: "#FFFFFF",
          boxShadow: "0px 8px 40px rgba(0,0,0,0.1)",
          borderRadius: 20, padding: "32px 40px",
          display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          <div style={{ background: "#ECF8E8", borderRadius: 20, padding: "7px 16px", marginBottom: 20 }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: "#315C2A" }}>✓ 저장 완료</span>
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 700, color: "#14141E", marginBottom: 10, textAlign: "center" }}>
            쿠폰이 저장되었어요!
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 400, color: "#828591", marginBottom: 28, textAlign: "center" }}>
            {couponName}이 내 쿠폰함에 추가되었습니다
          </div>
          <div style={{ width: "100%", height: 1, background: "#F0F1F5", marginBottom: 24 }} />
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 400, color: "#AAADB9", textAlign: "center" }}>
            {expiredText} · {minOrderText}
          </div>
        </div>
      </div>

      {/* 버튼 두 개 */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, padding: "0 20px" }}>
        <button
          onClick={() => window.location.href = "/"}
          style={{ width: 308, height: 56, background: "#233A73", border: "none", borderRadius: 14, fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700, color: "#FFFFFF", cursor: "pointer" }}
        >
          내 쿠폰함 보기
        </button>
        <button
          onClick={() => window.location.href = "/"}
          style={{ width: 308, height: 56, background: "#FFFFFF", border: "1px solid #DCDEE4", borderRadius: 14, fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 500, color: "#646773", cursor: "pointer" }}
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F6F7FA", fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* Hero 배너 */}
      <div style={{
        width: "100%", height: 220,
        background: "linear-gradient(99.28deg, #456E82 11.44%, #1C2E5C 84.03%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
      }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 400, color: "rgba(255,255,255,0.7)", margin: 0 }}>
          회원님을 위한 특별 혜택이 도착했어요
        </p>
        <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 44, fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
          3,000원 할인 쿠폰
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 400, color: "rgba(255,255,255,0.65)", margin: 0 }}>
          첫 구매 시 즉시 사용 가능 · 5만원 이상 주문
        </p>
      </div>

      {/* 쿠폰 카드 */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20, marginBottom: 40, padding: "0 20px" }}>
        <div style={{
          width: 480, height: 200,
          display: "flex", borderRadius: 16, overflow: "hidden",
          boxShadow: "0px 6.47px 12.94px -4.85px rgba(35,39,47,0.12), 0px 3.24px 6.47px -4.85px rgba(35,39,47,0.04)",
        }}>
          {/* 왼쪽 파란 영역 */}
          <div style={{
            flex: 1,
            background: "linear-gradient(43.84deg, #1C2E5C 7.19%, #3B61C2 75.51%)",
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
            padding: "20px 24px", gap: 8,
          }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 60, fontWeight: 700, color: "#FFFFFF", lineHeight: 1, letterSpacing: "-2px" }}>
              {discountDisplay}
            </div>
            <div style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>
              {couponName}
            </div>
            <div style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.6)" }}>
              발급일로부터 7일 유효
            </div>
          </div>

          {/* 점선 구분선 */}
          <div style={{
            width: 1,
            background: "repeating-linear-gradient(to bottom, #EBEDF0 0px, #EBEDF0 6px, transparent 6px, transparent 12px)",
            flexShrink: 0,
          }} />

          {/* 오른쪽 흰색 영역 — 체크 표시 */}
          <div style={{
            width: 120, background: "#FFFFFF",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, position: "relative",
          }}>
            <div style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", width: 32, height: 32, borderRadius: "50%", background: "#F6F7FA" }} />
            <div style={{ position: "absolute", bottom: -16, left: "50%", transform: "translateX(-50%)", width: 32, height: 32, borderRadius: "50%", background: "#F6F7FA" }} />
            <div style={{
              width: 54, height: 54, borderRadius: "50%", background: "#395DBA",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 700, color: "#FFFFFF", lineHeight: 1 }}>✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, padding: "0 20px" }}>
        <button
          onClick={() => window.location.href = "/"}
          style={{ width: 308, height: 56, background: "#233A73", border: "none", borderRadius: 14, fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700, color: "#FFFFFF", cursor: "pointer" }}
        >
          내 쿠폰함 보기
        </button>
        <button
          onClick={() => window.location.href = "/"}
          style={{ width: 308, height: 56, background: "#FFFFFF", border: "1px solid #DCDEE4", borderRadius: 14, fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 500, color: "#646773", cursor: "pointer" }}
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}