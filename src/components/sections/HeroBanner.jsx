import { useState, useEffect } from 'react'

const AI_SLIDES = [
  {
    type: 'ai',
    label: 'AI 맞춤 추천',
    greeting: '안녕하세요, ooo님 👋',
    subtitle: <>오늘 딱 맞는 상품을<br />골라왔어요</>,
    desc: '최근 검색·구매 패턴을 분석해 취향에 맞는 상품을 추천해드려요',
  },
  {
    type: 'product',
    tag: '오늘의 특가',
    badge: '30% OFF',
    emoji: '🎧',
    name: '갤럭시 버즈3 Pro 무선 이어폰',
    desc: '노이즈 캔슬링 · 최대 30시간 재생 · 방수 IPX7',
    price: '189,000원',
  },
  {
    type: 'product',
    tag: '신규 입고',
    badge: 'NEW',
    emoji: '👟',
    name: '나이키 에어맥스 270',
    desc: '탁월한 에어 쿠셔닝 · 10가지 컬러 · 유니섹스',
    price: '149,000원',
  },
  {
    type: 'product',
    tag: '재구매 추천',
    badge: '단골 혜택',
    emoji: '🧴',
    name: '세타필 모이스처라이징 크림',
    desc: '민감한 피부를 위한 보습 크림 · 무향·무색소',
    price: '18,500원',
  },
]

const DEFAULT_EVENT_SLIDES = [
  { title: <>추천 이벤트<br />및 쿠폰</>,    bg: 'rgba(212,212,212,0.95)', color: '#8B8B8B' },
]

const EVENT_COLORS = [
  { bg: 'rgba(255,107,107,0.18)', color: '#FF6B6B' },
  { bg: 'rgba(79,110,247,0.18)',  color: '#4F6EF7' },
  { bg: 'rgba(72,199,142,0.18)',  color: '#2E9B6E' },
  { bg: 'rgba(255,200,100,0.18)', color: '#E8A000' },
]

const AI_INTERVAL    = 3500
const EVENT_INTERVAL = 4000

export default function HeroBanner({ promotions = [], userName = '' }) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [activeEvent, setActiveEvent] = useState(0)
  const [pauseAI,    setPauseAI]    = useState(false)
  const [pauseEvent, setPauseEvent] = useState(false)

  // promotions 데이터로 이벤트 슬라이드 생성
  const eventSlides = promotions.length > 0
    ? promotions.map((p, i) => ({
        title: <>{p.couponName}<br />{p.discountAmount?.toLocaleString()}원 할인</>,
        bg:    EVENT_COLORS[i % EVENT_COLORS.length].bg,
        color: EVENT_COLORS[i % EVENT_COLORS.length].color,
        hasReceived: p.hasReceived,
      }))
    : DEFAULT_EVENT_SLIDES

  const aiSlides = AI_SLIDES.map(s =>
    s.type === 'ai' && userName
      ? { ...s, greeting: `안녕하세요, ${userName}님 👋` }
      : s
  )

  const aiLen    = aiSlides.length
  const eventLen = eventSlides.length

  const prevAI    = () => setActiveSlide(p => (p - 1 + aiLen) % aiLen)
  const nextAI    = () => setActiveSlide(p => (p + 1) % aiLen)
  const prevEvent = () => setActiveEvent(p => (p - 1 + eventLen) % eventLen)
  const nextEvent = () => setActiveEvent(p => (p + 1) % eventLen)

  useEffect(() => {
    if (pauseAI) return
    const t = setInterval(nextAI, AI_INTERVAL)
    return () => clearInterval(t)
  }, [pauseAI])

  useEffect(() => {
    if (pauseEvent) return
    const t = setInterval(nextEvent, EVENT_INTERVAL)
    return () => clearInterval(t)
  }, [pauseEvent])

  return (
    <>
      {/* ── AI 맞춤 추천 배너 ── */}
      <div
        className="ai-banner"
        onMouseEnter={() => setPauseAI(true)}
        onMouseLeave={() => setPauseAI(false)}
      >
        <div
          className="ai-slides-wrap"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {aiSlides.map((slide, i) => (
            <div key={i} className="ai-slide">
              {slide.type === 'ai' ? (
                <>
                  <div className="ai-deco-circle ai-deco-circle--outline" />
                  <div className="ai-deco-circle ai-deco-circle--rose" />
                  <span className="ai-label">{slide.label}</span>
                  <div className="ai-greeting">{slide.greeting}</div>
                  <div className="ai-subtitle">{slide.subtitle}</div>
                  <div className="ai-desc">{slide.desc}</div>
                </>
              ) : (
                <div className="ai-slide-product">
                  <div className="ai-product-img-wrap">{slide.emoji}</div>
                  <div className="ai-product-content">
                    <div className="ai-product-tag">{slide.tag}</div>
                    <div className="ai-product-badge">{slide.badge}</div>
                    <div className="ai-product-name">{slide.name}</div>
                    <div className="ai-product-desc">{slide.desc}</div>
                    <div className="ai-product-price">{slide.price}</div>
                    <button className="ai-product-cta">바로 구매 →</button>
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
          {aiSlides.map((_, i) => (
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
              {slide.hasReceived && (
                <div style={{ fontSize: 11, color: slide.color, marginTop: 4, opacity: 0.7 }}>수령 완료</div>
              )}
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