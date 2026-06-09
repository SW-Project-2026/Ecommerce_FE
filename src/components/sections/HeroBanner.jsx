import { useState, useEffect, useRef } from 'react'
import { getProduct } from '../../api/products'

const TAGS = ['이 상품 어때요?', '지금 인기 상품', '놓치지 마세요']

const DEFAULT_EVENT_SLIDES = [
  { title: <>추천 이벤트<br />및 쿠폰</>, bg: 'rgba(212,212,212,0.95)', color: '#8B8B8B' },
]

const EVENT_COLORS = [
  { bg: 'rgba(255,107,107,0.18)', color: '#FF6B6B' },
  { bg: 'rgba(79,110,247,0.18)',  color: '#4F6EF7' },
  { bg: 'rgba(72,199,142,0.18)',  color: '#2E9B6E' },
  { bg: 'rgba(255,200,100,0.18)', color: '#E8A000' },
]

const AI_INTERVAL    = 3500
const EVENT_INTERVAL = 4000

function toSlide(p, i) {
  return {
    type: 'product',
    tag: TAGS[i % TAGS.length],
    productId: p.productId,
    name: p.name ?? p.productName,
    category: p.productCategory ?? p.subCategory ?? '',
    price: p.minPrice ?? p.price,
    imageUrl: p.imageUrl,
    brand: p.brand ?? p.mallName ?? '',
  }
}

export default function HeroBanner({ promotions = [], userName = '', onNavigate, adProduct = null }) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [activeEvent, setActiveEvent] = useState(0)
  const [pauseAI,    setPauseAI]    = useState(false)
  const [pauseEvent, setPauseEvent] = useState(false)
  const [randomProducts, setRandomProducts] = useState([])
  const adReplaceRef = useRef(0)

  // 랜덤 상품 3개 조회 (1~1800 랜덤 ID)
  useEffect(() => {
    const MAX_ID = 1800
    const ids = []
    while (ids.length < 9) {
      const id = Math.floor(Math.random() * MAX_ID) + 1
      if (!ids.includes(id)) ids.push(id)
    }
    // 9개 시도해서 성공한 3개 사용
    Promise.allSettled(ids.map(id => getProduct(id)))
      .then(results => {
        const success = results
          .filter(r => r.status === 'fulfilled' && r.value)
          .map(r => r.value)
          .slice(0, 3)
        setRandomProducts(success)
      })
      .catch(() => {})
  }, [])

  // 광고 상품 수신 시 슬롯 교체
  useEffect(() => {
    if (!adProduct) return
    const idx = adProduct._replaceIndex ?? adReplaceRef.current
    adReplaceRef.current = (idx + 1) % 3
    setRandomProducts(prev => {
      const next = [...prev]
      next[idx] = adProduct
      return next
    })
  }, [adProduct])

  // AI 슬라이드 구성
  const productSlides = randomProducts.map((p, i) => toSlide(p, i))

  const aiSlides = [
    ...(userName ? [{
      type: 'ai',
      greeting: `안녕하세요, ${userName}님 👋`,
      subtitle: <>오늘 딱 맞는 상품을<br />골라왔어요</>,
      desc: '최근 검색·구매 패턴을 분석해 취향에 맞는 상품을 추천해드려요',
    }] : []),
    ...productSlides,
  ]

  const eventSlides = promotions.length > 0
    ? promotions.map((p, i) => ({
        title: <>
          {p.couponName}<br />
          {p.discountType === 'RATE' || (p.discountAmount <= 100 && !p.discountType)
            ? `${p.discountAmount}% 할인`
            : `${p.discountAmount?.toLocaleString()}원 할인`}
        </>,
        bg:    EVENT_COLORS[i % EVENT_COLORS.length].bg,
        color: EVENT_COLORS[i % EVENT_COLORS.length].color,
      }))
    : DEFAULT_EVENT_SLIDES

  const aiLen    = Math.max(aiSlides.length, 1)
  const eventLen = eventSlides.length

  const prevAI    = () => setActiveSlide(p => (p - 1 + aiLen) % aiLen)
  const nextAI    = () => setActiveSlide(p => (p + 1) % aiLen)
  const prevEvent = () => setActiveEvent(p => (p - 1 + eventLen) % eventLen)
  const nextEvent = () => setActiveEvent(p => (p + 1) % eventLen)

  useEffect(() => {
    if (pauseAI) return
    const t = setInterval(nextAI, AI_INTERVAL)
    return () => clearInterval(t)
  }, [pauseAI, aiLen])

  useEffect(() => {
    if (pauseEvent) return
    const t = setInterval(nextEvent, EVENT_INTERVAL)
    return () => clearInterval(t)
  }, [pauseEvent])

  return (
    <>
      <div
        className="ai-banner"
        onMouseEnter={() => setPauseAI(true)}
        onMouseLeave={() => setPauseAI(false)}
      >
        <div
          className="ai-slides-wrap"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {aiSlides.length === 0 ? (
            <div className="ai-slide">
              <div className="ai-deco-circle ai-deco-circle--outline" />
              <div className="ai-deco-circle ai-deco-circle--rose" />
              <div className="ai-greeting">안녕하세요 👋</div>
              <div className="ai-subtitle">오늘도 좋은 쇼핑 되세요</div>
            </div>
          ) : aiSlides.map((slide, i) => (
            <div key={i} className="ai-slide">
              {slide.type === 'ai' ? (
                <>
                  <div className="ai-deco-circle ai-deco-circle--outline" />
                  <div className="ai-deco-circle ai-deco-circle--rose" />
                  <div className="ai-greeting">{slide.greeting}</div>
                  <div className="ai-subtitle">{slide.subtitle}</div>
                  <div className="ai-desc">{slide.desc}</div>
                </>
              ) : (
                <div className="ai-slide-product">
                  <div className="ai-product-img-wrap">
                    {slide.imageUrl
                      ? <img src={slide.imageUrl} alt={slide.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                      : <span style={{ fontSize: 48 }}>🛍</span>}
                  </div>
                  <div className="ai-product-content">
                    <div className="ai-product-tag">{slide.tag}</div>
                    <div className="ai-product-name" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{slide.name}</div>
                    {slide.brand && <div className="ai-product-desc">{slide.brand}</div>}
                    {slide.category && <div className="ai-product-desc">{slide.category}</div>}
                    <div className="ai-product-price">{slide.price?.toLocaleString()}원</div>
                    <button className="ai-product-cta" onClick={() => onNavigate?.('product', slide.productId)}>바로 구매 →</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="banner-arrow banner-arrow--left"  onClick={prevAI}>
          <i className="ri-arrow-left-s-line" />
        </button>
        <button className="banner-arrow banner-arrow--right" onClick={nextAI}>
          <i className="ri-arrow-right-s-line" />
        </button>

        <div className="ai-pagination">
          {(aiSlides.length === 0 ? [0] : aiSlides).map((_, i) => (
            <button
              key={i}
              className={`dot${activeSlide === i ? ' active' : ''}`}
              onClick={() => setActiveSlide(i)}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── 이벤트 패널 ── */}
      <div
        className="event-panel"
        onMouseEnter={() => setPauseEvent(true)}
        onMouseLeave={() => setPauseEvent(false)}
      >
        <div
          className="event-slides-wrap"
          style={{ transform: `translateX(-${activeEvent * 100}%)` }}
        >
          {eventSlides.map((slide, i) => (
            <div key={i} className="event-slide" style={{ background: slide.bg }}>
              <div className="event-label" style={{ color: slide.color }}>
                {slide.title}
              </div>
            </div>
          ))}
        </div>

        <button className="banner-arrow banner-arrow--left"  onClick={prevEvent}>
          <i className="ri-arrow-left-s-line" />
        </button>
        <button className="banner-arrow banner-arrow--right" onClick={nextEvent}>
          <i className="ri-arrow-right-s-line" />
        </button>

        <div className="event-pagination">
          {eventSlides.map((_, i) => (
            <button
              key={i}
              className={`dot${activeEvent === i ? ' active' : ''}`}
              style={activeEvent === i
                ? { background: '#fff' }
                : { background: 'rgba(255,255,255,0.5)' }
              }
              onClick={() => setActiveEvent(i)}
              aria-label={`이벤트 ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </>
  )
}