import { useState } from 'react'

const INITIAL_ITEMS = [
  { emoji: '💻', name: '삼성 갤럭시북4 Pro 360 16인치', price: '1,290,000원' },
  { emoji: '👟', name: '나이키 에어맥스 270 리액트', price: '149,000원' },
  { emoji: '🎧', name: '소니 WH-1000XM5 무선 헤드폰', price: '389,000원' },
  { emoji: '💄', name: '헤라 블랙쿠션 23호 SPF34', price: '59,000원' },
  { emoji: '☕', name: '네스프레소 버츄오 플러스 커피머신', price: '189,000원' },
  { emoji: '🏋️', name: '나이키 테크 플리스 집업 후디', price: '129,000원' },
  { emoji: '📱', name: '삼성 갤럭시 S25 울트라 256GB', price: '1,499,000원' },
  { emoji: '🎮', name: '소니 플레이스테이션 5 슬림', price: '598,000원' },
]

export default function MyWishlist({ onNavigate }) {
  const [items, setItems] = useState(INITIAL_ITEMS)

  function handleRemove(idx) {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  if (items.length === 0) return (
    <div className="myp-section">
      <div className="myp-section-title"><i className="ri-heart-line" />찜한 상품</div>
      <div className="myp-empty">
        <i className="ri-heart-line" />
        찜한 상품이 없어요
      </div>
    </div>
  )

  return (
    <div className="myp-section">
      <div className="myp-section-title">
        <i className="ri-heart-line" />
        찜한 상품
        <span style={{ fontSize: 12, fontWeight: 400, color: '#9E9E9E', marginLeft: 4 }}>
          ({items.length}개)
        </span>
      </div>

      <div className="myp-wishlist-grid">
        {items.map((item, i) => (
          <div className="myp-wishlist-card" key={i} onClick={() => onNavigate('home')}>
            <div className="myp-wishlist-thumb">
              {item.emoji}
              <button
                className="myp-wishlist-del"
                onClick={e => { e.stopPropagation(); handleRemove(i) }}
                aria-label="찜 해제"
              >
                <i className="ri-close-line" />
              </button>
            </div>
            <div className="myp-wishlist-name">{item.name}</div>
            <div className="myp-wishlist-price">{item.price}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
