import { useState, useEffect } from 'react'
import { couponDetail, couponDownload } from '../api/coupons'

export default function PromotionCouponPage({ couponId, onNavigate }) {
  const [step,       setStep]       = useState('loading') // loading | ready | success | error
  const [couponData, setCouponData] = useState(null)
  const [errorMsg,   setErrorMsg]   = useState(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!couponId) {
      setErrorMsg('유효하지 않은 쿠폰입니다.')
      setStep('error')
      return
    }
    couponDetail({ couponId })
      .then(data => {
        setCouponData(data)
        setStep('ready')
      })
      .catch(err => {
        setErrorMsg(err.message ?? '쿠폰 정보를 불러올 수 없습니다.')
        setStep('error')
      })
  }, [couponId])

  async function handleDownload() {
    if (downloading) return
    setDownloading(true)
    try {
      await couponDownload({ couponId })
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
  const expiredAt      = couponData?.expiredAt      ?? null

  const discountDisplay = discountAmount
    ? discountType === 'RATE'
      ? <>{discountAmount}<span style={{ fontSize: 24, fontWeight: 500 }}>%</span></>
      : <>{discountAmount.toLocaleString()}<span style={{ fontSize: 24, fontWeight: 500 }}>원</span></>
    : null

  const minOrderText = minOrder ? `${minOrder.toLocaleString()}원 이상 주문 시` : ''
  const expiredText  = expiredAt ? `유효기간 ${expiredAt}까지` : '발급일로부터 7일 유효'

  const btnStyle = {
    primary: {
      flex: 1, height: 56,
      background: '#233A73', border: 'none', borderRadius: 14,
      fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700,
      color: '#FFFFFF', cursor: 'pointer',
    },
    secondary: {
      flex: 1, height: 56,
      background: '#FFFFFF', border: '1px solid #DCDEE4', borderRadius: 14,
      fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 500,
      color: '#646773', cursor: 'pointer',
    },
  }

  if (step === 'loading') return (
    <div style={{ minHeight: '100vh', background: '#F6F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 14, color: '#9EA6B5' }}>쿠폰을 불러오는 중...</p>
    </div>
  )

  if (step === 'error') return (
    <div style={{ minHeight: '100vh', background: '#F6F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 40 }}>😥</div>
      <p style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 16, fontWeight: 700, color: '#121212' }}>쿠폰을 받을 수 없어요</p>
      <p style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 13, color: '#9EA6B5' }}>{errorMsg}</p>
      <button onClick={() => onNavigate?.('home')} style={{ ...btnStyle.secondary, flex: 'none', width: 200, marginTop: 8 }}>홈으로 돌아가기</button>
    </div>
  )

  if (step === 'success') return (
    <div style={{ minHeight: '100vh', background: '#F6F7FA', fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* Hero */}
      <div style={{
        width: '100%', height: 280,
        background: 'linear-gradient(97.92deg, #436A80 0.29%, #1C2E5C 84.81%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 88, height: 88, borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 44, fontWeight: 700, color: '#FFFFFF', lineHeight: 1 }}>✓</span>
        </div>
      </div>

      {/* 성공 카드 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: -60, padding: '0 20px', marginBottom: 32 }}>
        <div style={{
          width: 640, background: '#FFFFFF',
          boxShadow: '0px 8px 40px rgba(0,0,0,0.1)',
          borderRadius: 20, padding: '32px 40px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <div style={{ background: '#ECF8E8', borderRadius: 20, padding: '7px 16px', marginBottom: 20 }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: '#315C2A' }}>✓ 저장 완료</span>
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 700, color: '#14141E', marginBottom: 10, textAlign: 'center' }}>
            쿠폰이 저장되었어요!
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: '#828591', marginBottom: 28, textAlign: 'center' }}>
            {couponName}이 내 쿠폰함에 추가되었습니다
          </div>
          <div style={{ width: '100%', height: 1, background: '#F0F1F5', marginBottom: 24 }} />
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#AAADB9', textAlign: 'center' }}>
            {expiredText}{minOrderText ? ` · ${minOrderText}` : ''}
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, padding: '0 20px', maxWidth: 640, margin: '0 auto' }}>
        <button onClick={() => onNavigate?.('mypage', 'coupons')} style={btnStyle.primary}>내 쿠폰함 보기</button>
        <button onClick={() => onNavigate?.('home')} style={btnStyle.secondary}>홈으로 돌아가기</button>
      </div>
    </div>
  )

  // ready
  return (
    <div style={{ minHeight: '100vh', background: '#F6F7FA', fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* Hero */}
      <div style={{
        width: '100%', height: 220,
        background: 'linear-gradient(99.28deg, #456E82 11.44%, #1C2E5C 84.03%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          회원님을 위한 특별 혜택이 도착했어요
        </p>
        <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 44, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
          {discountAmount
            ? discountType === 'RATE'
              ? `${discountAmount}% 할인 쿠폰`
              : `${discountAmount.toLocaleString()}원 할인 쿠폰`
            : couponName}
        </h1>
        {minOrderText && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.65)', margin: 0 }}>
            {minOrderText}
          </p>
        )}
      </div>

      {/* 쿠폰 카드 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20, marginBottom: 40, padding: '0 20px' }}>
        <div style={{
          width: 480, height: 200,
          display: 'flex', borderRadius: 16, overflow: 'hidden',
          boxShadow: '0px 6.47px 12.94px -4.85px rgba(35,39,47,0.12)',
        }}>
          <div style={{
            flex: 1,
            background: 'linear-gradient(43.84deg, #1C2E5C 7.19%, #3B61C2 75.51%)',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            padding: '20px 24px', gap: 8,
          }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 60, fontWeight: 700, color: '#FFFFFF', lineHeight: 1, letterSpacing: '-2px' }}>
              {discountDisplay}
            </div>
            <div style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>
              {couponName}
            </div>
            <div style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              {expiredText}
            </div>
          </div>
          <div style={{
            width: 1,
            background: 'repeating-linear-gradient(to bottom, #EBEDF0 0px, #EBEDF0 6px, transparent 6px, transparent 12px)',
            flexShrink: 0,
          }} />
          <div style={{
            width: 120, background: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', width: 32, height: 32, borderRadius: '50%', background: '#F6F7FA' }} />
            <div style={{ position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)', width: 32, height: 32, borderRadius: '50%', background: '#F6F7FA' }} />
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                width: 54, height: 54, borderRadius: '50%',
                background: downloading ? '#7a9bd4' : '#395DBA',
                border: 'none', cursor: downloading ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, padding: '0 20px', maxWidth: 640, margin: '0 auto' }}>
        <button onClick={handleDownload} disabled={downloading} style={{ ...btnStyle.primary, opacity: downloading ? 0.7 : 1 }}>
          {downloading ? '발급 중...' : '쿠폰 받기'}
        </button>
        <button onClick={() => onNavigate?.('home')} style={btnStyle.secondary}>홈으로 돌아가기</button>
      </div>
    </div>
  )
}