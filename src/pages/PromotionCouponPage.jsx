import { useState, useEffect } from 'react'
import { couponDetail, couponDownload } from '../api/coupons'
import { couponReceived } from '../api/snippets'

export default function PromotionCouponPage({ couponId, onNavigate }) {
  const [step,        setStep]        = useState('loading')
  const [couponData,  setCouponData]  = useState(null)
  const [errorMsg,    setErrorMsg]    = useState(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!couponId) { setErrorMsg('유효하지 않은 쿠폰입니다.'); setStep('error'); return }
    couponDetail({ couponId })
      .then(data => { setCouponData(data); setStep('ready') })
      .catch(err => { setErrorMsg(err.message ?? '쿠폰 정보를 불러올 수 없습니다.'); setStep('error') })
  }, [couponId])

  async function handleDownload() {
    if (downloading) return
    setDownloading(true)
    try {
      await couponDownload({ couponId })
      const amount = discountAmount
        ? discountType === 'RATE'
          ? `${discountAmount}%`
          : `${discountAmount.toLocaleString()}원`
        : null
      couponReceived({
        couponCode:     couponName,
        discountAmount: amount,
        expiryDate:     null,
      }).catch(() => {})
      setStep('success')
    } catch (err) {
      setErrorMsg(err.message ?? '쿠폰 발급에 실패했습니다.')
      setStep('error')
    } finally {
      setDownloading(false)
    }
  }

  const couponName     = couponData?.name          ?? '할인 쿠폰'
  const discountAmount = couponData?.discountAmount ?? null
  const discountType   = couponData?.discountType   ?? null
  const minOrder       = couponData?.minOrderAmount ?? null

  const discountText = discountAmount
    ? discountType === 'RATE'
      ? `${discountAmount}%`
      : `${discountAmount.toLocaleString()}원`
    : ''

  const minOrderText = minOrder ? `${minOrder.toLocaleString()}원 이상 주문` : '5만원 이상 주문'

  const s = {
    page: {
      minHeight: '100vh',
      background: '#F6F7FA',
      fontFamily: "'Inter', sans-serif",
    },
    // 피그마: hero height 360px, top 38px (nav 높이만큼)
    hero: {
      width: '100%',
      height: 360,
      background: 'linear-gradient(99.28deg, #456E82 11.44%, #1C2E5C 84.03%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    },
    // 쿠폰카드: 피그마 555×276.69, left 442px (중앙), top 323px → marginTop으로 반절 올림
    couponWrap: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: -60,
      padding: '0 20px',
      marginBottom: 48,
    },
    coupon: {
      width: 555,
      height: 277,
      display: 'flex',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0px 6.47px 12.94px -4.85px rgba(35,39,47,0.12), 0px 3.24px 6.47px -4.85px rgba(35,39,47,0.04)',
    },
    couponLeft: {
      flex: 1,
      background: 'linear-gradient(43.84deg, #1C2E5C 7.19%, #3B61C2 75.51%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: '20px 26px 24px',
      gap: 8,
    },
    couponRight: {
      width: 116,
      background: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      position: 'relative',
    },
    btnRow: {
      display: 'flex',
      justifyContent: 'center',
      gap: 16,
      padding: '0 20px',
      maxWidth: 640,
      margin: '0 auto',
    },
    btnPrimary: {
      flex: 1, height: 56,
      background: '#233A73', border: 'none', borderRadius: 14,
      fontSize: 16, fontWeight: 700, color: '#fff', cursor: 'pointer',
    },
    btnSecondary: {
      flex: 1, height: 56,
      background: '#fff', border: '1px solid #DCDEE4', borderRadius: 14,
      fontSize: 16, fontWeight: 500, color: '#646773', cursor: 'pointer',
    },
  }

  if (step === 'loading') return (
    <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: 14, color: '#9EA6B5' }}>쿠폰을 불러오는 중...</p>
    </div>
  )

  if (step === 'error') return (
    <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 40 }}>😥</div>
      <p style={{ fontSize: 16, fontWeight: 700, color: '#121212' }}>쿠폰을 받을 수 없어요</p>
      <p style={{ fontSize: 13, color: '#9EA6B5' }}>{errorMsg}</p>
      <button onClick={() => onNavigate?.('home')} style={{ ...s.btnSecondary, flex: 'none', width: 200, marginTop: 8 }}>홈으로 돌아가기</button>
    </div>
  )

  if (step === 'success') return (
    <div style={s.page}>
      <div style={{ width: '100%', height: 280, background: 'linear-gradient(97.92deg, #436A80 0.29%, #1C2E5C 84.81%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 44, fontWeight: 700, color: '#fff', lineHeight: 1 }}>✓</span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: -60, padding: '0 20px', marginBottom: 32 }}>
        <div style={{ width: 640, background: '#fff', boxShadow: '0px 8px 40px rgba(0,0,0,0.1)', borderRadius: 20, padding: '32px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: '#ECF8E8', borderRadius: 20, padding: '7px 16px', marginBottom: 20 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#315C2A' }}>✓ 저장 완료</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#14141E', marginBottom: 10, textAlign: 'center' }}>쿠폰이 저장되었어요!</div>
          <div style={{ fontSize: 14, color: '#828591', marginBottom: 28, textAlign: 'center' }}>{couponName}이 내 쿠폰함에 추가되었습니다</div>
          <div style={{ width: '100%', height: 1, background: '#F0F1F5', marginBottom: 24 }} />
          <div style={{ fontSize: 13, color: '#AAADB9', textAlign: 'center' }}>
            발급일로부터 7일 유효 · {minOrderText}
          </div>
        </div>
      </div>
      <div style={s.btnRow}>
        <button onClick={() => onNavigate?.('mypage', 'coupons')} style={s.btnPrimary}>내 쿠폰함 보기</button>
        <button onClick={() => onNavigate?.('home')} style={s.btnSecondary}>홈으로 돌아가기</button>
      </div>
    </div>
  )

  // ready — 피그마 기준 레이아웃
  return (
    <div style={s.page}>
      {/* Hero: 피그마 height 360px */}
      <div style={s.hero}>
        <p style={{ fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          회원님을 위한 특별 혜택
        </p>
        <h1 style={{ fontSize: 44, fontWeight: 700, color: '#FFFFFF', margin: 0, textAlign: 'center' }}>
          {couponName}
        </h1>
        {minOrderText && (
          <p style={{ fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.65)', margin: 0 }}>
            {minOrderText}
          </p>
        )}
      </div>

      {/* 쿠폰 카드: 피그마 555×277, top 323px → marginTop -60으로 hero에 걸쳐짐 */}
      <div style={s.couponWrap}>
        <div style={s.coupon}>
          {/* 왼쪽: 파란 그라데이션 */}
          <div style={s.couponLeft}>
            {/* 피그마 Title: font-size 97.08px, line-height 45px */}
            <div style={{ fontSize: 52, fontWeight: 700, color: '#FFFFFF', lineHeight: '45px', letterSpacing: '-2px', marginBottom: 16 }}>
              {discountText}
            </div>
            {/* 피그마 Support Text: font-size 21.035px, font-weight 500 */}
            <div style={{ fontSize: 21, fontWeight: 500, color: 'rgba(255,255,255,0.8)', fontFamily: 'Manrope, Inter, sans-serif', lineHeight: '32px' }}>
              {couponName}
            </div>
            {/* 피그마 Support Text: font-size 16.18px */}
            <div style={{ fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.6)', fontFamily: 'Manrope, Inter, sans-serif', lineHeight: '32px' }}>
              발급일로부터 7일 유효
            </div>
          </div>

          {/* 점선 구분 */}
          <div style={{
            width: 1, flexShrink: 0,
            background: 'repeating-linear-gradient(to bottom, #EBEDF0 0px, #EBEDF0 6px, transparent 6px, transparent 12px)',
          }} />

          {/* 오른쪽: 흰색 + 다운로드 버튼 */}
          {/* 피그마: Ellipse 53.4×53.4, background #395DBA */}
          <div style={s.couponRight}>
            <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', width: 32, height: 32, borderRadius: '50%', background: '#F6F7FA' }} />
            <div style={{ position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)', width: 32, height: 32, borderRadius: '50%', background: '#F6F7FA' }} />
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                width: 53, height: 53, borderRadius: '50%',
                background: downloading ? '#7a9bd4' : '#395DBA',
                border: 'none', cursor: downloading ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div style={s.btnRow}>
        <button onClick={() => onNavigate?.('mypage', 'coupons')} style={s.btnPrimary}>
          내 쿠폰함 보기
        </button>
        <button onClick={() => onNavigate?.('home')} style={s.btnSecondary}>
          홈으로 돌아가기
        </button>
      </div>
    </div>
  )
}