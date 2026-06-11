import { useState } from 'react'
import ProductCard from '../common/ProductCard'

const CARD_STEP = 332

export default function PurchasedSection({ onNavigate, auth, products = [], wishMap = {}, setWishMap }) {
  const [offset, setOffset] = useState(0)
  const maxOffset = Math.max(0, (products.length - 4) * CARD_STEP)

  function handleNext() {
    setOffset(prev => prev >= maxOffset ? 0 : prev + CARD_STEP)
  }

  if (products.length === 0) return null

  return (
    <section className="section-repurchase">
      <div className="section-indicator" />
      <div className="section-title">이전에 구매한 상품</div>
      <div className="view-all">전체보기 ›</div>
      <div className="nav-arrow" onClick={handleNext}>
        <i className="ri-arrow-down-wide-fill" />
      </div>
      <div className="carousel-clip">
        <div className="products-row" style={{ transform: `translateX(-${offset}px)` }}>
          {products.map((item, i) => (
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