import { useState } from 'react'
import { wishlistAdd, wishlistDelete } from '../../api/wishlists'

const WIDTHS = [399, 398, 399]

function BestCard({ rank, productId, productName, price, imageUrl, isWishlisted, wishId: initialWishId, width, onNavigate, auth }) {
  const [liked, setLiked] = useState(isWishlisted ?? false)
  const [wishId, setWishId] = useState(initialWishId ?? null)

  async function handleLike(e) {
    e.stopPropagation()
    if (!auth) {
      onNavigate?.('login')
      return
    }
    try {
      if (liked) {
        await wishlistDelete({ wishId })
        setWishId(null)
        setLiked(false)
      } else {
        const res = await wishlistAdd({ productId })
        setWishId(res?.wishId ?? null)
        setLiked(true)
      }
    } catch {
      // 실패 시 상태 유지
    }
  }

  function handleClick() {
    if (productId) onNavigate?.('product', productId)
  }

  return (
    <div className="best-card" style={{ width }}>
      <div className="best-thumb" style={{ width, height: 385 }} onClick={handleClick}>
        {imageUrl
          ? <img src={imageUrl} alt={productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : null}
        <div className="rank-badge">{rank}위</div>
        <button className="heart-btn best-heart" onClick={handleLike} aria-label="찜하기">
          <i className={liked ? 'ri-heart-fill' : 'ri-heart-line'} style={{ color: '#FF6B6B' }} />
        </button>
      </div>
      <div className="best-info">
        <div className="best-name">{productName}</div>
        <div className="best-price">{price?.toLocaleString()}원</div>
      </div>
    </div>
  )
}

export default function BestSection({ onNavigate, auth, products = [] }) {
  if (products.length === 0) return null

  return (
    <section className="section-best">
      <div className="section-indicator" />
      <div className="section-title">베스트</div>
      <div className="section-subtitle-best">지금 가장 많이 팔리는 상품</div>
      <div className="view-all">전체보기 ›</div>
      <div className="best-row">
        {products.map((item, i) => (
          <BestCard
            key={item.productId ?? i}
            rank={item.rank}
            productId={item.productId}
            productName={item.productName}
            price={item.price}
            imageUrl={item.imageUrl}
            isWishlisted={item.isWishlisted}
            wishId={item.wishId}
            width={WIDTHS[i] ?? 399}
            onNavigate={onNavigate}
            auth={auth}
          />
        ))}
      </div>
    </section>
  )
}