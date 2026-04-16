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

const EVENT_SLIDES = [
  { title: <>추천 이벤트<br />및 쿠폰</>,    bg: 'rgba(212,212,212,0.95)', color: '#8B8B8B' },
  { title: <>신규 가입<br />쿠폰 5,000원</>, bg: 'rgba(255,107,107,0.18)', color: '#FF6B6B' },
  { title: <>오늘의<br />플래시 세일</>,     bg: 'rgba(79,110,247,0.18)',  color: '#4F6EF7' },
  { title: <>친구 추천<br />적립금 혜택</>,  bg: 'rgba(72,199,142,0.18)',  color: '#2E9B6E' },
]

const AI_INTERVAL    = 3500
const EVENT_INTERVAL = 4000

export default function HeroBanner() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [activeEvent, setActiveEvent] = useState(0)
  const [pauseAI,    setPauseAI]    = useState(false)
  const [pauseEvent, setPauseEvent] = useState(false)

  const aiLen    = AI_SLIDES.length
  const eventLen = EVENT_SLIDES.length

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
          {AI_SLIDES.map((slide, i) => (
            <div key={i} className="ai-slide">
              {slide.type === 'ai' ? (
                <>
                  {/* 장식 원 */}
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

        {/* 화살표 버튼 */}
        <button className="banner-arrow banner-arrow--left"  onClick={prevAI}>
          <i className="ri-arrow-left-s-line" />
        </button>
        <button className="banner-arrow banner-arrow--right" onClick={nextAI}>
          <i className="ri-arrow-right-s-line" />
        </button>

        {/* 페이지네이션 dot */}
        <div className="ai-pagination">
          {AI_SLIDES.map((_, i) => (
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
          {EVENT_SLIDES.map((slide, i) => (
            <div key={i} className="event-slide" style={{ background: slide.bg }}>
              <div className="event-label" style={{ color: slide.color }}>
                {slide.title}
              </div>
            </div>
          ))}
        </div>

        {/* 화살표 버튼 */}
        <button className="banner-arrow banner-arrow--left"  onClick={prevEvent}>
          <i className="ri-arrow-left-s-line" />
        </button>
        <button className="banner-arrow banner-arrow--right" onClick={nextEvent}>
          <i className="ri-arrow-right-s-line" />
        </button>

        <div className="event-pagination">
          {EVENT_SLIDES.map((_, i) => (
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
