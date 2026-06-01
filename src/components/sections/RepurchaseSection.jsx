import { useState } from 'react'
import ProductCard from '../common/ProductCard'

const ITEMS = [
  { name: '닥터브로너스 퓨어 캐스틸 솝', price: '22,000원' },
  { name: '세타필 모이스처라이징 크림', price: '18,500원' },
  { name: '비오템 아쿠아소스 크림', price: '54,000원' },
  { name: '라로슈포제 시카플라스트 밤', price: '19,000원' },
  { name: '에스티로더 어드밴스드 나이트 리페어', price: '89,000원' },
  { name: '이니스프리 그린티 씨드 세럼', price: '28,000원' },
  { name: '코스알엑스 달팽이 에센스', price: '24,000원' },
  { name: '더퍼스트 리소제 앰플', price: '38,000원' },
]

const CARD_STEP = 332

export default function RepurchaseSection() {
  const [offset, setOffset] = useState(0)
  const maxOffset = (ITEMS.length - 4) * CARD_STEP

  function handleNext() {
    setOffset(prev => prev >= maxOffset ? 0 : prev + CARD_STEP)
  }

  return (
    <section className="section-repurchase">
      <div className="section-indicator" />
      <div className="section-title">최근 본 상품</div>
      <div className="view-all">전체보기 ›</div>
      <div className="nav-arrow" onClick={handleNext}>
        <i className="ri-arrow-down-wide-fill" />
      </div>
      <div className="carousel-clip">
        <div className="products-row" style={{ transform: `translateX(-${offset}px)` }}>
          {ITEMS.map((item, i) => (
            <ProductCard key={i} thumbHeight={186.69} name={item.name} price={item.price} />
          ))}
        </div>
      </div>
    </section>
  )
}