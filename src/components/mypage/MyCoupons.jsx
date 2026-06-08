import { useState, useEffect } from 'react'
import { userCouponList } from '../../api/coupons'

const DISCOUNT_TYPE_DISPLAY = { FIXED: '원 할인', PERCENT: '% 할인', RATE: '% 할인' }

const TABS = [
  { key: 'AVAILABLE', label: '사용 가능' },
  { key: 'USED',      label: '사용 완료' },
  { key: 'EXPIRED',   label: '기간 만료' },
]

function isExpiringSoon(expiredAt) {
  if (!expiredAt) return false
  const diff = new Date(expiredAt) - new Date()
  return diff > 0 && diff < 1000 * 60 * 60 * 24 * 3 // 3일 이내
}

export default function MyCoupons() {
  const [tab,     setTab]     = useState('AVAILABLE')
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [counts,  setCounts]  = useState({ AVAILABLE: 0, USED: 0, EXPIRED: 0 })

  useEffect(() => { fetchCoupons(tab) }, [tab])

  // 탭 전환 시 개수 표시를 위해 최초 진입 시 전체 탭 개수 조회
  useEffect(() => {
    async function fetchCounts() {
      try {
        const [available, used, expired] = await Promise.allSettled([
          userCouponList({ status: 'AVAILABLE', size: 100 }),
          userCouponList({ status: 'USED',      size: 100 }),
          userCouponList({ status: 'EXPIRED',   size: 100 }),
        ])
        setCounts({
          AVAILABLE: available.status === 'fulfilled' ? (available.value.content?.length ?? 0) : 0,
          USED:      used.status      === 'fulfilled' ? (used.value.content?.length      ?? 0) : 0,
          EXPIRED:   expired.status   === 'fulfilled' ? (expired.value.content?.length   ?? 0) : 0,
        })
      } catch {}
    }
    fetchCounts()
  }, [])

  async function fetchCoupons(status) {
    setLoading(true); setError(null)
    try {
      const data = await userCouponList({ status, size: 100 })
      setCoupons(data.content ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="myp-section">
      <div className="myp-section-title">
        <i className="ri-coupon-3-line" />
        쿠폰함
      </div>

      <div className="myp-coupon-tabs">
        {TABS.map(t => (
          <div
            key={t.key}
            className={`myp-coupon-tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label} ({counts[t.key]})
          </div>
        ))}
      </div>

      {loading && <div style={{ fontSize: 13, color: '#9EA6B4', padding: '16px 0' }}>불러오는 중...</div>}
      {error   && <div style={{ fontSize: 13, color: '#EF4444', padding: '8px 0' }}>{error}</div>}

      {!loading && !error && coupons.length === 0 && (
        <div className="myp-empty">
          <i className="ri-coupon-3-line" />
          쿠폰이 없어요
        </div>
      )}

      {!loading && !error && coupons.length > 0 && (
        <div className="myp-coupon-grid">
          {coupons.map(c => {
            const soon = tab === 'AVAILABLE' && isExpiringSoon(c.expiredAt)
            const isRed = c.discountType === 'FIXED'
            return (
              <div
                key={c.userCouponId}
                className={`myp-coupon-card${tab === 'USED' ? ' myp-coupon-card--used' : ''}${tab === 'EXPIRED' ? ' myp-coupon-card--expired' : ''}`}
              >
                <div className={`myp-coupon-left${isRed ? ' myp-coupon-left--red' : ''}`}>
                  <div className="myp-coupon-disc">
                    {c.discountType === 'FIXED' ? c.discountAmount?.toLocaleString() : c.discountAmount}
                  </div>
                  <div className="myp-coupon-disc-type">
                    {DISCOUNT_TYPE_DISPLAY[c.discountType] ?? c.discountType}
                  </div>
                </div>
                <div className="myp-coupon-right">
                  <div className="myp-coupon-name">{c.couponName}</div>
                  <div className="myp-coupon-cond">
                    {c.minOrderAmount ? `${c.minOrderAmount?.toLocaleString()}원 이상 구매 시` : '조건 없음'}
                  </div>
                  {c.discountType !== 'FIXED' && c.maxDiscountAmount && (
                    <div className="myp-coupon-cond">
                      최대 {c.maxDiscountAmount?.toLocaleString()}원 할인
                    </div>
                  )}
                  <div className={`myp-coupon-expire${soon ? ' myp-coupon-expire--soon' : ''}`}>
                    {soon ? '⚠ ' : ''}~{c.expiredAt ? new Date(c.expiredAt).toLocaleDateString('ko-KR') : '–'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}