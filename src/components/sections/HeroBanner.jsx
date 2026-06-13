import { useState, useEffect } from 'react'
import { getProduct, getProducts, searchProducts } from '../../api/products'
import { clickAd, adExposure } from '../../api/snippets'

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

function toSlide(p, i, adBanner = null) {
  return {
    type: 'product',
    tag: TAGS[i % TAGS.length],
    productId: p.productId,
    name: p.name ?? p.productName ?? p.title,
    category: p.productCategory ?? p.subCategory ?? p.category ?? p.category1 ?? '',
    price: p.minPrice ?? p.price ?? Number(p.lowestPrice),
    imageUrl: p.imageUrl ?? p.image,
    brand: p.brand ?? p.mallName ?? '',
    isAd: !!adBanner,
    adId: adBanner?.adId ?? null,
  }
}

export default function HeroBanner({ promotions = [], userName = '', onNavigate, adBanner = null, onPromotionClick, userId = null }) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [activeEvent, setActiveEvent] = useState(0)
  const [pauseAI,    setPauseAI]    = useState(false)
  const [pauseEvent, setPauseEvent] = useState(false)
  const [adProduct,  setAdProduct]  = useState(null)

  // 광고 배너 상품 정보 조회
  useEffect(() => {
    if (!adBanner) { setAdProduct(null); return }

    if (adBanner.targetType === 'PRODUCT' && adBanner.productId) {
      getProduct(adBanner.productId)
        .then(data => setAdProduct(data))
        .catch(() => setAdProduct(null))
    } else if (adBanner.targetType === 'CATEGORY' && adBanner.category) {
      getProducts({ category: adBanner.category, size: 20 })
        .then(res => {
          const list = res.content ?? []
          const product = list[Math.floor(Math.random() * list.length)] ?? null
          setAdProduct(product)
        })
        .catch(() => setAdProduct(null))
    } else if (adBanner.targetType === 'KEYWORD' && adBanner.keyword) {
      searchProducts({ query: adBanner.keyword, display: 20 })
        .then(res => {
          const list = res.products ?? []
          const product = list[Math.floor(Math.random() * list.length)] ?? null
          setAdProduct(product)
        })
        .catch(() => setAdProduct(null))
    } else if (adBanner.productId) {
      getProduct(adBanner.productId)
        .then(data => setAdProduct(data))
        .catch(() => setAdProduct(null))
    } else {
      setAdProduct(null)
    }
  }, [adBanner])

  // 광고 슬라이드 구성
  const aiSlides = adProduct ? [toSlide(adProduct, 0, adBanner)] : []

  const eventSlides = promotions.length > 0
    ? promotions.map((p, i) => ({
        title: <>
          {p.couponName}<br />
          {p.discountType === 'RATE'
            ? `${p.discountAmount}% 할인`
            : `${p.discountAmount?.toLocaleString()}원 할인`}
        </>,
        bg:       EVENT_COLORS[i % EVENT_COLORS.length].bg,
        color:    EVENT_COLORS[i % EVENT_COLORS.length].color,
        couponId: p.couponId,
      }))
    : DEFAULT_EVENT_SLIDES

  // 광고 슬라이드 노출 시 adExposure 호출
  useEffect(() => {
    const slide = aiSlides[activeSlide]
    if (!slide?.isAd) return
    adExposure({
      adId:            slide.adId,
      productName:     slide.name,
      productId:       slide.productId,
      productCategory: slide.category || null,
      userId,
    }).catch(() => {})
  }, [activeSlide, aiSlides.length])

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
            <div className="ai-slide" />
          ) : aiSlides.map((slide, i) => (
            <div key={i} className="ai-slide">
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
                  <button className="ai-product-cta" onClick={() => {
                    if (slide.isAd) {
                      clickAd({
                        adId:            slide.adId,
                        productName:     slide.name,
                        productId:       slide.productId,
                        productCategory: slide.category || null,
                        userId,
                      }).catch(() => {})
                    }
                    onNavigate?.('product', slide.productId)
                  }}>바로 구매 →</button>
                </div>
              </div>
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
            <div
              key={i}
              className="event-slide"
              style={{ background: slide.bg, cursor: slide.couponId ? 'pointer' : 'default' }}
              onClick={() => slide.couponId && onPromotionClick?.(slide.couponId)}
            >
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