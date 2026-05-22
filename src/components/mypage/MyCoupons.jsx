import { useState } from 'react'

const COUPONS = {
  available: [
    { disc: '20%', type: '할인', name: '패션 카테고리 20% 쿠폰', cond: '5만원 이상 구매 시', expire: '2025.04.30', soon: true, red: false },
    { disc: '5,000', type: '원 할인', name: '첫 구매 감사 쿠폰', cond: '3만원 이상 구매 시', expire: '2025.05.15', soon: false, red: true },
    { disc: '10%', type: '할인', name: 'VIP 전용 할인 쿠폰', cond: '10만원 이상 구매 시', expire: '2025.06.01', soon: false, red: false },
  ],
  used: [
    { disc: '15%', type: '할인', name: '가전 카테고리 쿠폰', cond: '10만원 이상 구매 시', expire: '2025.03.31', soon: false, red: false },
  ],
  expired: [
    { disc: '3,000', type: '원 할인', name: '생일 축하 쿠폰', cond: '1만원 이상 구매 시', expire: '2025.02.28', soon: false, red: true },
  ],
}

const TABS = [
  { key: 'available', label: `사용 가능 (${COUPONS.available.length})` },
  { key: 'used',      label: `사용 완료 (${COUPONS.used.length})` },
  { key: 'expired',   label: `기간 만료 (${COUPONS.expired.length})` },
]

export default function MyCoupons() {
  const [tab, setTab] = useState('available')

  const list = COUPONS[tab]

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
            {t.label}
          </div>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="myp-empty">
          <i className="ri-coupon-3-line" />
          쿠폰이 없어요
        </div>
      ) : (
        <div className="myp-coupon-grid">
          {list.map((c, i) => (
            <div
              key={i}
              className={`myp-coupon-card${tab === 'used' ? ' myp-coupon-card--used' : ''}${tab === 'expired' ? ' myp-coupon-card--expired' : ''}`}
            >
              <div className={`myp-coupon-left${c.red ? ' myp-coupon-left--red' : ''}`}>
                <div className="myp-coupon-disc">{c.disc}</div>
                <div className="myp-coupon-disc-type">{c.type}</div>
              </div>
              <div className="myp-coupon-right">
                <div className="myp-coupon-name">{c.name}</div>
                <div className="myp-coupon-cond">{c.cond}</div>
                <div className={`myp-coupon-expire${c.soon ? ' myp-coupon-expire--soon' : ''}`}>
                  {c.soon ? '⚠ ' : ''}~{c.expire}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
