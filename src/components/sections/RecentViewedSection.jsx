import { useState } from 'react'
import ProductCard from '../common/ProductCard'

const CARD_STEP = 332

export default function RecentViewedSection({ onNavigate, auth, products = [], fallbackProducts = [], isFallback = false, wishMap = {}, setWishMap }) {
  const [offset, setOffset] = useState(0)

  const displayProducts = isFallback ? fallbackProducts.slice(0, 12) : products
  const maxOffset = Math.max(0, (displayProducts.length - 4) * CARD_STEP)

  function handleNext() {
    setOffset(prev => prev >= maxOffset ? 0 : prev + CARD_STEP)
  }

  if (!auth || displayProducts.length === 0) return null

  return (
    <section className="section-timebased">
      <div className="section-indicator" style={{ background: '#1C2E5C' }} />
      <div className="section-title">
        {isFallback ? '이런 상품을 찾고 있나요?' : '최근 본 상품'}
      </div>
      <div className="view-all" style={{ color: '#1C2E5C' }}></div>
      <div className="nav-arrow" onClick={handleNext}>
        <i className="ri-arrow-down-wide-fill" />
      </div>
      <div className="carousel-clip">
        <div className="products-row" style={{ transform: `translateX(-${offset}px)` }}>
          {displayProducts.map((item, i) => (
            <ProductCard
              key={item.productId ?? i}
              thumbHeight={186.69}
              productId={item.productId}
              name={item.productName}
              productCategory={item.category ?? null}
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