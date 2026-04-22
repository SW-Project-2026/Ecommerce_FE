import { useState } from 'react'

const AI_PRODUCTS = [
  { emoji: '👟', name: '나이키 에어맥스 270 리액트', price: '149,000원', badge: 'AI 추천' },
  { emoji: '🎧', name: '소니 WH-1000XM5 노이즈캔슬링', price: '389,000원', badge: null },
  { emoji: '💄', name: '헤라 블랙쿠션 23호', price: '59,000원', badge: '재구매 급등' },
  { emoji: '☕', name: '네스프레소 버츄오 플러스', price: '189,000원', badge: null },
]

const STAT_CARDS = [
  { icon: 'ri-coin-line',      color: 'navy',   label: '포인트',     value: '12,500P', sub: '유효기간 D-30' },
  { icon: 'ri-coupon-3-line',  color: 'red',    label: '사용 가능 쿠폰', value: '3장',    sub: '곧 만료 1장' },
  { icon: 'ri-heart-line',     color: 'green',  label: '찜한 상품',  value: '8개',    sub: null },
  { icon: 'ri-shopping-bag-line', color: 'yellow', label: '이번 달 주문', value: '2건', sub: null },
]

const ORDER_FLOW = [
  { label: '결제완료',  count: 1 },
  { label: '배송중',    count: 2 },
  { label: '배송완료',  count: 5 },
  { label: '취소·반품', count: 0 },
]

export default function MyHome({ onNavigate }) {
  const [liked, setLiked] = useState({})

  function toggleLike(i) {
    setLiked(prev => ({ ...prev, [i]: !prev[i] }))
  }

  return (
    <>
      {/* 상단 통계 카드 */}
      <div className="myp-stats-row">
        {STAT_CARDS.map((s, i) => (
          <div className="myp-stat-card" key={i}>
            <div className={`myp-stat-icon myp-stat-icon--${s.color}`}>
              <i className={s.icon} />
            </div>
            <div>
              <div className="myp-stat-label">{s.label}</div>
              <div className="myp-stat-value">{s.value}</div>
              {s.sub && <div className="myp-stat-sub">{s.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* 주문 현황 */}
      <div className="myp-section" style={{ padding: 0 }}>
        <div className="myp-order-flow">
          {ORDER_FLOW.map((f, i) => (
            <div className="myp-flow-item" key={i} onClick={() => onNavigate('orders')}>
              <div className="myp-flow-count">{f.count}</div>
              <div className="myp-flow-label">{f.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 재구매 알림 배너 */}
      <div className="myp-repurchase-banner" onClick={() => onNavigate('product', 1)}>
        <div className="myp-repurchase-icon">📦</div>
        <div>
          <div className="myp-repurchase-title">유한킴벌리 화이트 3겹 휴지 — 재구매 시기가 왔어요!</div>
          <div className="myp-repurchase-sub">마지막 구매: 2025.03.10 · 평균 주기 45일</div>
        </div>
        <button className="myp-repurchase-cta">바로 구매하기</button>
      </div>

      {/* AI 추천 상품 */}
      <div className="myp-section">
        <div className="myp-ai-header">
          <div>
            <div className="myp-ai-badge">✨ AI 맞춤 추천</div>
            <div className="myp-ai-title">김다온님, 이런 상품 어떠세요?</div>
            <div className="myp-ai-desc">최근 검색·구매 패턴을 분석해 골랐어요</div>
          </div>
          <span className="myp-ai-viewall" onClick={() => onNavigate('home')}>전체보기 ›</span>
        </div>

        <div className="myp-products-row">
          {AI_PRODUCTS.map((p, i) => (
            <div className="myp-product-card" key={i} onClick={() => onNavigate('home')}>
              <div className="myp-product-thumb">
                {p.emoji}
                {p.badge && <span className="myp-product-badge">{p.badge}</span>}
                <button
                  className="myp-product-heart"
                  onClick={e => { e.stopPropagation(); toggleLike(i) }}
                  aria-label="찜하기"
                >
                  <i className={liked[i] ? 'ri-heart-fill' : 'ri-heart-line'} style={{ color: '#FF6B6B' }} />
                </button>
              </div>
              <div className="myp-product-name">{p.name}</div>
              <div className="myp-product-price">{p.price}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
