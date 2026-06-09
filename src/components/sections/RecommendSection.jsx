import { useState } from 'react'
import ProductCard from '../common/ProductCard'

const CARD_STEP = 332

export default function RecommendSection({ onNavigate, auth, products = [], category = '', wishMap = {}, setWishMap }) {
  const [offset, setOffset] = useState(0)
  const maxOffset = Math.max(0, (products.length - 4) * CARD_STEP)

  function handleNext() {
    setOffset(prev => prev >= maxOffset ? 0 : prev + CARD_STEP)
  }

  if (products.length === 0) return null

  return (
    <section className="section-recommend">
      <div className="section-divider" />
      <div className="section-indicator" />
      <div className="section-title">이런 상품을 찾고 있나요?</div>
      {category && <div className="section-subtitle">관심 있는 카테고리 {category}</div>}
      <div className="nav-arrow" onClick={handleNext}>
        <i className="ri-arrow-down-wide-fill" />
      </div>
      <div className="carousel-clip">
        <div className="products-row" style={{ transform: `translateX(-${offset}px)` }}>
          {products.map((item, i) => (
            <ProductCard
              key={item.productId ?? i}
              thumbHeight={257}
              productId={item.productId}
              name={item.productName}
              price={`${item.price?.toLocaleString()}원`}
              imageUrl={item.imageUrl}
              wishMap={wishMap}
              setWishMap={setWishMap}
              onNavigate={onNavigate}
              auth={auth}
            />
          ))}
        </div>
      </div>
    </section>
  )
}