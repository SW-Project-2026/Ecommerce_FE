import { useState } from 'react'
import ProductCard from '../common/ProductCard'

const ITEMS = [
  { name: '스타벅스 콜드브루 블랙', price: '5,500원' },
  { name: '네스프레소 버투오 캡슐', price: '34,000원' },
  { name: '동원 리얼참치 135g', price: '3,200원' },
  { name: '오뚜기 3분 카레 순한맛', price: '1,500원' },
  { name: '농심 신라면 5봉', price: '4,800원' },
  { name: '하인즈 토마토 케첩', price: '6,200원' },
  { name: '롯데 ABC 초콜릿', price: '2,800원' },
  { name: '빙그레 바나나맛 우유 6팩', price: '7,900원' },
]

const CARD_STEP = 332

export default function TimeBasedSection({ onNavigate, auth }) {
  const [offset, setOffset] = useState(0)
  const maxOffset = (ITEMS.length - 4) * CARD_STEP

  function handleNext() {
    setOffset(prev => prev >= maxOffset ? 0 : prev + CARD_STEP)
  }

  return (
    <section className="section-timebased">
      <div className="section-indicator" style={{ background: '#1C2E5C' }} />
      <div className="section-title">이전에 구매한 상품</div>
      <div className="view-all" style={{ color: '#1C2E5C' }}>전체보기 ›</div>
      <div className="nav-arrow" onClick={handleNext}>
        <i className="ri-arrow-down-wide-fill" />
      </div>
      <div className="carousel-clip">
        <div className="products-row" style={{ transform: `translateX(-${offset}px)` }}>
          {ITEMS.map((item, i) => (
            <ProductCard key={i} thumbHeight={186.69} name={item.name} price={item.price} onNavigate={onNavigate} auth={auth} />
          ))}
        </div>
      </div>
    </section>
  )
}