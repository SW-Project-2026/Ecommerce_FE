import { useState, useEffect } from 'react'
import { orderList } from '../../api/orders'
import { wishlistGet } from '../../api/wishlists'
import { userCouponList } from '../../api/coupons'

export default function MyHome({ onNavigate }) {
  const [couponCount,  setCouponCount]  = useState('–')
  const [wishCount,    setWishCount]    = useState('–')
  const [orderCounts,  setOrderCounts]  = useState({ PENDING: 0, SHIPPING: 0, DELIVERED: 0, CANCELLED: 0 })
  const [expiringSoon, setExpiringSoon] = useState(0)

  useEffect(() => {
    // 사용 가능 쿠폰 수 + 곧 만료 쿠폰 수
    userCouponList({ status: 'AVAILABLE', size: 100 })
      .then(data => {
        const list = data.content ?? []
        setCouponCount(list.length)
        const soon = list.filter(c => {
          if (!c.expiredAt) return false
          const diff = new Date(c.expiredAt) - new Date()
          return diff > 0 && diff < 1000 * 60 * 60 * 24 * 3
        }).length
        setExpiringSoon(soon)
      })
      .catch(() => {})

    // 찜한 상품 수
    wishlistGet({ size: 100 })
      .then(data => setWishCount(data.content?.length ?? 0))
      .catch(() => {})

    // 주문 현황 (전체 조회 후 상태별 카운트)
    orderList({ period: 'all', size: 100 })
      .then(data => {
        const list = data.content ?? []
        const counts = { PENDING: 0, CONFIRMED: 0, SHIPPING: 0, DELIVERED: 0, CANCELLED: 0 }
        list.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++ })
        setOrderCounts({
          PENDING:   (counts.PENDING ?? 0) + (counts.CONFIRMED ?? 0),
          SHIPPING:  counts.SHIPPING  ?? 0,
          DELIVERED: counts.DELIVERED ?? 0,
          CANCELLED: counts.CANCELLED ?? 0,
        })
      })
      .catch(() => {})
  }, [])

  const statCards = [
    {
      icon: 'ri-coupon-3-line', color: 'red', label: '사용 가능 쿠폰',
      value: `${couponCount}장`,
      sub: expiringSoon > 0 ? `곧 만료 ${expiringSoon}장` : null,
    },
    { icon: 'ri-heart-line',        color: 'green',  label: '찜한 상품',    value: `${wishCount}개`, sub: null },
    { icon: 'ri-shopping-bag-line', color: 'yellow', label: '이번 달 주문', value: `${(orderCounts.PENDING + orderCounts.SHIPPING + orderCounts.DELIVERED + orderCounts.CANCELLED)}건`, sub: null },
  ]

  const orderFlow = [
    { label: '결제완료',  count: orderCounts.PENDING   },
    { label: '배송중',    count: orderCounts.SHIPPING  },
    { label: '배송완료',  count: orderCounts.DELIVERED },
    { label: '취소·반품', count: orderCounts.CANCELLED },
  ]

  return (
    <>
      <div className="myp-stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {statCards.map((s, i) => (
          <div className="myp-stat-card" key={i} style={{ padding: '32px 24px', minHeight: '140px', boxSizing: 'border-box' }}>
            <div className={`myp-stat-icon myp-stat-icon--${s.color}`} style={{ width: '56px', height: '56px', fontSize: '26px' }}>
              <i className={s.icon} />
            </div>
            <div>
              <div className="myp-stat-label" style={{ fontSize: '13px', marginBottom: '4px' }}>{s.label}</div>
              <div className="myp-stat-value" style={{ fontSize: '26px', fontWeight: '800' }}>{s.value}</div>
              {s.sub && <div className="myp-stat-sub" style={{ fontSize: '11px', marginTop: '4px' }}>{s.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="myp-section" style={{ padding: 0 }}>
        <div className="myp-order-flow">
          {orderFlow.map((f, i) => (
            <div className="myp-flow-item" key={i} onClick={() => onNavigate('orders')} style={{ padding: '48px 12px' }}>
              <div className="myp-flow-count" style={{ fontSize: '32px', marginBottom: '6px' }}>{f.count}</div>
              <div className="myp-flow-label" style={{ fontSize: '13px' }}>{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}