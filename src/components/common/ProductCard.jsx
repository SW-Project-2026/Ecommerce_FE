import { useState } from 'react'

export default function ProductCard({ name = '상품명', price = '89,000원', thumbHeight = 257, onNavigate, auth }) {
  const [liked, setLiked] = useState(false)

  function handleLike(e) {
    e.stopPropagation()
    if (!auth) {
      onNavigate?.('login')
      return
    }
    setLiked(prev => !prev)
  }

  return (
    <div className="product-card">
      <div className="product-thumb" style={{ height: thumbHeight }}>
        <button className="heart-btn" onClick={handleLike} aria-label="찜하기">
          <i className={liked ? 'ri-heart-fill' : 'ri-heart-line'} style={{ color: '#FF6B6B' }} />
        </button>
      </div>
      <div className="product-info">
        <div className="product-name">{name}</div>
        <div className="product-price">{price}</div>
      </div>
    </div>
  )
}