import { useState } from 'react'

const STAT_CARDS = [
  { icon: 'ri-coupon-3-line',     color: 'red',    label: '사용 가능 쿠폰', value: '3장',  sub: '곧 만료 1장' },
  { icon: 'ri-heart-line',        color: 'green',  label: '찜한 상품',      value: '8개',  sub: null },
  { icon: 'ri-shopping-bag-line', color: 'yellow', label: '이번 달 주문',   value: '2건',  sub: null },
]

const ORDER_FLOW = [
  { label: '결제완료',  count: 1 },
  { label: '배송중',    count: 2 },
  { label: '배송완료',  count: 5 },
  { label: '취소·반품', count: 0 },
]

export default function MyHome({ onNavigate }) {
  return (
    <>
      {/* 상단 통계 카드 — 높이(padding) 및 폰트 크기 확대 */}
      <div className="myp-stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {STAT_CARDS.map((s, i) => (
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

      {/* 주문 현황 — 위아래 여백(padding)을 대폭 키워 시원하게 배치 */}
      <div className="myp-section" style={{ padding: 0 }}>
        <div className="myp-order-flow">
          {ORDER_FLOW.map((f, i) => (
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