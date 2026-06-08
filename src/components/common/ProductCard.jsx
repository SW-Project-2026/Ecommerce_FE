import { useState } from 'react'

export default function ProductCard({ name = '상품명', price = '89,000원', thumbHeight = 257, imageUrl, productId, isWishlisted = false, onNavigate, auth }) {
  const [liked, setLiked] = useState(isWishlisted)

  function handleLike(e) {
    e.stopPropagation()
    if (!auth) {
      onNavigate?.('login')
      return
    }
    setLiked(prev => !prev)
  }

  function handleClick() {
    if (productId) onNavigate?.('product', productId)
  }

  return (
    <div className="product-card" onClick={handleClick} style={{ cursor: productId ? 'pointer' : 'default' }}>
      <div className="product-thumb" style={{ height: thumbHeight, overflow: 'hidden', position: 'relative' }}>
        {imageUrl
          ? <img src={imageUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', background: '#F0F1F3' }} />
        }
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