import { useState } from 'react'
import ProductCard from '../common/ProductCard'

const ITEMS = [
  { name: '나이키 에어맥스 270', price: '149,000원' },
  { name: '아디다스 울트라부스트', price: '189,000원' },
  { name: '뉴발란스 574', price: '109,000원' },
  { name: '반스 올드스쿨', price: '79,000원' },
  { name: '컨버스 척테일러', price: '69,000원' },
  { name: '살로몬 스피드크로스', price: '159,000원' },
  { name: '아식스 겔-카야노', price: '139,000원' },
  { name: '호카 클리프턴 9', price: '179,000원' },
]

const CARD_STEP = 332 // 292 + 40

export default function RecommendSection() {
  const [offset, setOffset] = useState(0)
  const maxOffset = (ITEMS.length - 4) * CARD_STEP

  function handleNext() {
    setOffset(prev => prev >= maxOffset ? 0 : prev + CARD_STEP)
  }

  return (
    <section className="section-recommend">
      <div className="section-divider" />
      <div className="section-indicator" />
      <div className="section-title">이런 상품을 찾고 있나요?</div>
      <div className="section-subtitle">관심 있는 카테고리 패션</div>
      <div className="view-all">전체보기 ›</div>
      <div className="nav-arrow" onClick={handleNext}>
        <i className="ri-arrow-down-wide-fill" />
      </div>
      <div className="carousel-clip">
        <div className="products-row" style={{ transform: `translateX(-${offset}px)` }}>
          {ITEMS.map((item, i) => (
            <ProductCard key={i} thumbHeight={257} name={item.name} price={item.price} />
          ))}
        </div>
      </div>
    </section>
  )
}
