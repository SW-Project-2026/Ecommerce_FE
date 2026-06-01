import { useState } from 'react'

const BEST_ITEMS = [
  { rank: '1위', name: '갤럭시 버즈3 Pro 무선 이어폰', price: '189,000원', width: 399 },
  { rank: '2위', name: '갤럭시 버즈3 Pro 무선 이어폰', price: '189,000원', width: 398 },
  { rank: '3위', name: '갤럭시 버즈3 Pro 무선 이어폰', price: '189,000원', width: 399 },
]

function BestCard({ rank, name, price, width, onNavigate, auth }) {
  const [liked, setLiked] = useState(false)

  function handleLike() {
    if (!auth) {
      onNavigate?.('login')
      return
    }
    setLiked(prev => !prev)
  }

  return (
    <div className="best-card" style={{ width }}>
      <div className="best-thumb" style={{ width, height: 385 }}>
        <div className="rank-badge">{rank}</div>
        <button className="heart-btn best-heart" onClick={handleLike} aria-label="찜하기">
          <i className={liked ? 'ri-heart-fill' : 'ri-heart-line'} style={{ color: '#FF6B6B' }} />
        </button>
      </div>
      <div className="best-info">
        <div className="best-name">{name}</div>
        <div className="best-price">{price}</div>
      </div>
    </div>
  )
}

export default function BestSection({ onNavigate, auth }) {
  return (
    <section className="section-best">
      <div className="section-indicator" />
      <div className="section-title">베스트</div>
      <div className="section-subtitle-best">지금 가장 많이 팔리는 상품</div>
      <div className="view-all">전체보기 ›</div>
      <div className="best-row">
        {BEST_ITEMS.map(item => (
          <BestCard key={item.rank} {...item} onNavigate={onNavigate} auth={auth} />
        ))}
      </div>
    </section>
  )
}