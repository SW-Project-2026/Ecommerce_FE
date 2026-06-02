import { useEffect, useRef, useState } from 'react'
import { getProduct } from '../api/products'
import { viewProductDetail, clickCart, clickWishlist } from '../api/snippets'
import { cartAdd } from '../api/carts'
import { wishlistAdd, wishlistDelete, wishlistGet } from '../api/wishlists'
import './ReviewSection.css'

const RELATED_VISIBLE = 5
const INACTIVE_THRESHOLD = 5000

const MOCK_REVIEWS_POOL = [
  { id: 1, loginId: 'kim****', rating: 5, text: '배송도 빠르고 품질이 정말 좋아요. 사진이랑 실제 상품이 똑같이 생겼습니다. 재구매 의향 있어요!', createdAt: '2025-05-12' },
  { id: 2, loginId: 'lee****', rating: 4, text: '전반적으로 만족합니다. 다만 포장이 조금 아쉬웠어요. 상품 자체는 훌륭합니다.', createdAt: '2025-05-08' },
  { id: 3, loginId: 'park***', rating: 5, text: '가격 대비 최고예요. 주변에도 추천해줬습니다. 색상도 사진이랑 똑같고 소재가 생각보다 고급져요.', createdAt: '2025-04-30' },
  { id: 4, loginId: 'choi**', rating: 3, text: '평균 정도입니다. 기대가 너무 컸나봐요. 나쁘지는 않은데 특별히 좋지도 않아요.', createdAt: '2025-04-22' },
  { id: 5, loginId: 'jung**', rating: 5, text: '두 번째 구매인데 역시 실망 없네요. 이 가격에 이 퀄리티면 무조건 사야죠.', createdAt: '2025-04-18' },
  { id: 6, loginId: 'oh****', rating: 4, text: '배송 빠르고 상품 상태 깨끗합니다. 다음에 또 구매할 것 같아요.', createdAt: '2025-04-10' },
  { id: 7, loginId: 'shin**', rating: 2, text: '생각보다 크기가 작았어요. 사이즈 표기를 더 명확히 해줬으면 좋겠습니다.', createdAt: '2025-03-29' },
  { id: 8, loginId: 'yoon**', rating: 5, text: '완전 만족합니다!! 선물용으로 샀는데 받은 분도 좋아하셨어요. 포장도 이쁘게 해주셨어요.', createdAt: '2025-03-20' },
]

function getMockReviews(productId) {
  const seed = Number(productId) % 4
  const sliceMap = [[0, 4], [1, 5], [2, 6], [3, 7]]
  const [start, end] = sliceMap[seed] ?? [0, 4]
  return MOCK_REVIEWS_POOL.slice(start, end)
}

const RATING_LABELS = ['', '별로예요', '아쉬워요', '보통이에요', '좋아요', '최고예요!']

function StarRating({ value, onChange, size = 28 }) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value
  return (
    <div className="review-stars">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} className={`review-star-btn${display >= n ? ' active' : ''}`} style={{ fontSize: size }}
          onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)} type="button" aria-label={`${n}점`}>★</button>
      ))}
    </div>
  )
}

function StarDisplay({ rating, className = 'review-item-star' }) {
  return (
    <div className="review-item-stars">
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={`${className}${n <= rating ? ' filled' : ''}`}>★</span>
      ))}
    </div>
  )
}

function AvgStars({ avg }) {
  return (
    <div className="review-avg-stars">
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={`review-avg-star${n <= Math.floor(avg) ? ' filled' : n - 0.5 <= avg ? ' half' : ''}`}>★</span>
      ))}
    </div>
  )
}

function Avatar({ loginId }) {
  const initial = loginId ? loginId[0].toUpperCase() : '?'
  return <div className="review-avatar">{initial}</div>
}

function ReviewSection({ productId, userId }) {
  const [reviews, setReviews] = useState(() => getMockReviews(productId))
  const [rating,  setRating]  = useState(0)
  const [text,    setText]    = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [sort,    setSort]    = useState('latest')

  const canSubmit = rating > 0 && text.trim().length >= 5
  const avg = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0

  const sorted = [...reviews].sort((a, b) => {
    if (sort === 'latest')  return new Date(b.createdAt) - new Date(a.createdAt)
    if (sort === 'highest') return b.rating - a.rating
    if (sort === 'lowest')  return a.rating - b.rating
    return 0
  })

  function handleSubmit() {
    if (!canSubmit) return
    const newReview = { id: Date.now(), loginId: userId ?? '나', rating, text: text.trim(), createdAt: new Date().toISOString().slice(0, 10) }
    setReviews(prev => [newReview, ...prev])
    setRating(0); setText(''); setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="review-wrap">
      <div className="review-write-box">
        <div className="review-rating-col">
          <span className="review-rating-label">평점 선택</span>
          <StarRating value={rating} onChange={setRating} />
          <span className="review-rating-text">{RATING_LABELS[rating]}</span>
        </div>
        <div className="review-input-col">
          <textarea className="review-textarea" placeholder="상품 사용 후기를 남겨주세요. (최소 5자)" value={text} onChange={e => setText(e.target.value)} maxLength={500} />
          <div className="review-submit-row">
            <span className="review-char-count">{text.length} / 500</span>
            <button className="review-submit-btn" onClick={handleSubmit} disabled={!canSubmit}>리뷰 등록</button>
          </div>
        </div>
      </div>
      {submitted && <div className="review-submitted-msg">✓ 리뷰가 등록되었습니다. 감사합니다!</div>}
      {reviews.length > 0 && (
        <div className="review-summary">
          <span className="review-avg-score">{avg.toFixed(1)}</span>
          <div className="review-avg-right"><AvgStars avg={avg} /><span className="review-avg-count">총 {reviews.length}개의 리뷰</span></div>
        </div>
      )}
      <div className="review-list-header">
        <span className="review-list-title">리뷰 {reviews.length}개</span>
        {reviews.length > 1 && (
          <select className="review-sort-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="latest">최신순</option>
            <option value="highest">별점 높은 순</option>
            <option value="lowest">별점 낮은 순</option>
          </select>
        )}
      </div>
      {reviews.length === 0 ? (
        <div className="review-empty"><div className="review-empty-icon">★</div><p>아직 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요!</p></div>
      ) : (
        <div className="review-list">
          {sorted.map(r => (
            <div key={r.id} className="review-item">
              <div className="review-item-top">
                <div className="review-item-left">
                  <Avatar loginId={r.loginId} />
                  <div className="review-user-info">
                    <span className="review-login-id">{r.loginId}</span>
                    <span className="review-date">{r.createdAt}</span>
                  </div>
                </div>
                <StarDisplay rating={r.rating} />
              </div>
              <p className="review-text">{r.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Breadcrumb({ product, prevCategory, onNavigate }) {
  const topCategory = prevCategory ?? null
  const topLabel    = topCategory?.label ?? ''
  return (
    <div className="pdp-breadcrumb">
      <span onClick={() => onNavigate('home')} className="pdp-bc-link">홈</span>
      {topCategory && (<><span className="pdp-bc-sep"> &gt; </span><span onClick={() => onNavigate('list', topCategory)} className="pdp-bc-link">{topLabel}</span></>)}
      {product.mallName && (<><span className="pdp-bc-sep"> &gt; </span><span className="pdp-bc-current">{product.mallName}</span></>)}
      <span className="pdp-bc-sep"> &gt; </span>
      <span className="pdp-bc-current">{product.name}</span>
    </div>
  )
}

function RelatedProducts() {
  return (
    <div className="pdp-related">
      <h3 className="pdp-related-title">연관 상품</h3>
      <div className="pdp-related-row">
        <div className="pdp-related-grid">
          {Array.from({ length: RELATED_VISIBLE }).map((_, i) => (
            <div key={i} className="pdp-related-card">
              <div className="pdp-related-thumb pdp-no-image" />
              <div className="pdp-related-name pdp-skeleton" />
              <div className="pdp-related-price pdp-skeleton" />
            </div>
          ))}
        </div>
        <button className="pdp-related-arrow"><i className="ri-arrow-right-s-line" /></button>
      </div>
    </div>
  )
}

function CartToast({ visible, onGoCart }) {
  return (
    <div className={`pdp-cart-toast${visible ? ' pdp-cart-toast--show' : ''}`}>
      <span className="pdp-cart-toast-msg">✓ 장바구니에 담겼습니다</span>
      <button className="pdp-cart-toast-btn" onClick={onGoCart}>장바구니 보기</button>
    </div>
  )
}

export default function ProductDetailPage({ productId, onNavigate, prevCategory, onAddToCart, userId = null, auth = null }) {
  const [product,   setProduct]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [qty,       setQty]       = useState(1)
  const [activeTab, setActiveTab] = useState('detail')
  const [liked,     setLiked]     = useState(false)
  const [wishId,    setWishId]    = useState(null)
  const [cartToast, setCartToast] = useState(false)
  const [cartError, setCartError] = useState(null)
  const toastTimerRef    = useRef(null)
  const activeDwellRef   = useRef(0)
  const activeStartRef   = useRef(null)
  const inactiveTimerRef = useRef(null)

  function requireAuth(callback) {
    if (!auth) { onNavigate('login'); return }
    callback()
  }

  // 상품 로드
  useEffect(() => {
    setLoading(true); setError(null); setQty(1); setLiked(false); setWishId(null)
    getProduct(productId)
      .then(data => setProduct(data))
      .catch(() => setError('상품을 불러오지 못했어요.'))
      .finally(() => setLoading(false))
  }, [productId])

  // 찜 초기 상태 확인
  useEffect(() => {
    if (!auth || !productId) return
    wishlistGet({ size: 100 })
      .then(data => {
        const found = (data.content ?? []).find(w => String(w.productId) === String(productId))
        if (found) { setLiked(true); setWishId(found.wishId) }
        else       { setLiked(false); setWishId(null) }
      })
      .catch(() => {})
  }, [auth, productId])

  // 체류 시간 측정
  useEffect(() => {
    if (!product) return
    const startActive = () => { if (activeStartRef.current === null) activeStartRef.current = Date.now() }
    const stopActive  = () => {
      if (activeStartRef.current !== null) {
        activeDwellRef.current += Date.now() - activeStartRef.current
        activeStartRef.current = null
      }
    }
    const handleActivity = () => {
      startActive()
      if (inactiveTimerRef.current) clearTimeout(inactiveTimerRef.current)
      inactiveTimerRef.current = setTimeout(stopActive, INACTIVE_THRESHOLD)
    }
    const events = ['mousemove', 'click', 'scroll', 'keydown']
    events.forEach(e => window.addEventListener(e, handleActivity))
    startActive()
    return () => {
      stopActive()
      if (inactiveTimerRef.current) clearTimeout(inactiveTimerRef.current)
      events.forEach(e => window.removeEventListener(e, handleActivity))
      const dwellTime = Math.floor(activeDwellRef.current / 1000)
      if (dwellTime > 0) {
        viewProductDetail({ productName: product.name, productId: String(productId), dwellTime, productCategory: product.productCategory ?? null, userId })
      }
      activeDwellRef.current = 0; activeStartRef.current = null
    }
  }, [product])

  async function addToCartApi() {
    setCartError(null)
    try {
      await cartAdd({ productId: product.productId, quantity: qty })
      onAddToCart?.(product, qty)
      // ── 장바구니 담기 스니펫 (로그인 유저만 호출됨) ──
      clickCart({
        productName:     product.name,
        productId:       product.productId,
        productCategory: product.productCategory ?? null,
        actionType:      'add',
        userId:          auth.userId,
      })
    } catch (err) { setCartError(err.message); throw err }
  }

  async function handleBuyNow() {
    if (!product) return
    requireAuth(async () => { try { await addToCartApi(); onNavigate('cart') } catch {} })
  }

  async function handleAddToCartWithToast() {
    if (!product) return
    requireAuth(async () => {
      try {
        await addToCartApi()
        setCartToast(true)
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
        toastTimerRef.current = setTimeout(() => setCartToast(false), 3000)
      } catch {}
    })
  }

  async function handleLike() {
    requireAuth(async () => {
      try {
        if (liked) {
          await wishlistDelete({ wishId })
          setLiked(false); setWishId(null)
          // ── 찜 제거 스니펫 (로그인 유저만 호출됨) ──
          clickWishlist({
            productName:     product.name,
            productId:       product.productId,
            productCategory: product.productCategory ?? null,
            actionType:      'remove',
            userId:          auth.userId,
          })
        } else {
          const data = await wishlistAdd({ productId: product.productId })
          setLiked(true); setWishId(data.wishId)
          // ── 찜 추가 스니펫 (로그인 유저만 호출됨) ──
          clickWishlist({
            productName:     product.name,
            productId:       product.productId,
            productCategory: product.productCategory ?? null,
            actionType:      'add',
            userId:          auth.userId,
          })
        }
      } catch (err) { console.error('찜 처리 실패:', err.message) }
    })
  }

  const total   = product ? (product.minPrice * qty).toLocaleString() : '0'
  if (loading)  return <div className="sp-status">불러오는 중...</div>
  if (error)    return <div className="sp-status sp-error">{error}</div>
  if (!product) return null

  const image   = product.imageUrl ?? null
  const soldOut = product.stockQuantity === 0

  return (
    <div className="pdp-wrap">
      <CartToast visible={cartToast} onGoCart={() => onNavigate('cart')} />
      <Breadcrumb product={product} prevCategory={prevCategory} onNavigate={onNavigate} />

      <div className="pdp-content">
        <div className="pdp-gallery">
          <div className="pdp-main-img">
            {image ? <img src={image} alt={product.name} /> : <div className="pdp-no-image" />}
          </div>
        </div>

        <div className="pdp-info">
          {product.brand && <div className="pdp-brand">{product.brand}</div>}
          <h1 className="pdp-name">{product.name}</h1>
          <div className="pdp-price-area">
            <span className="pdp-price">{product.minPrice.toLocaleString()}원</span>
            {product.maxPrice > product.minPrice && <span className="pdp-max-price">최고가 {product.maxPrice.toLocaleString()}원</span>}
          </div>
          <div className="pdp-info-box">
            <div className="pdp-info-row"><span className="pdp-info-label">반품/교환</span><span className="pdp-info-value">무료 반품 (수령 후 30일 이내)</span></div>
            <div className="pdp-info-row"><span className="pdp-info-label">배송비</span><span className="pdp-info-value pdp-free-ship">무료배송</span></div>
          </div>
          <div className="pdp-qty-row">
            <span className="pdp-qty-label">수량</span>
            <div className="pdp-qty-ctrl">
              <button className="pdp-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
              <span className="pdp-qty-num">{qty}</span>
              <button className="pdp-qty-btn" onClick={() => setQty(q => q + 1)} disabled={soldOut || qty >= product.stockQuantity}>+</button>
            </div>
          </div>
          <div className="pdp-total-row">
            <span className="pdp-total-label">총 상품금액</span>
            <span className="pdp-total-price">{total}원</span>
          </div>
          {cartError && <div style={{ fontSize: 13, color: '#EF4444', marginBottom: 8 }}>{cartError}</div>}
          <button className="pdp-buy-btn" disabled={soldOut} onClick={handleBuyNow}>{soldOut ? '품절' : '바로 구매하기'}</button>
          <div className="pdp-sub-btns">
            <button className="pdp-cart-btn" disabled={soldOut} onClick={handleAddToCartWithToast}>장바구니 담기</button>
            <button className={`pdp-like-btn${liked ? ' active' : ''}`} onClick={handleLike}>
              <i className={liked ? 'ri-heart-fill' : 'ri-heart-line'} /> 찜하기
            </button>
          </div>
        </div>
      </div>

      <div className="pdp-tabs">
        {[{ key: 'detail', label: '상품 상세' }, { key: 'review', label: '리뷰' }, { key: 'return', label: '배송/반품/교환' }].map(tab => (
          <button key={tab.key} className={`pdp-tab${activeTab === tab.key ? ' active' : ''}`} onClick={() => setActiveTab(tab.key)}>{tab.label}</button>
        ))}
      </div>

      <div className="pdp-tab-content">
        {activeTab === 'detail' && <p className="pdp-desc">{product.description || '상품 상세 정보가 없습니다.'}</p>}
        {activeTab === 'review' && <ReviewSection productId={productId} userId={userId} />}
        {activeTab === 'return' && <div className="pdp-desc"><p>· 반품/교환: 수령 후 30일 이내 무료</p><p>· 배송비: 무료배송</p></div>}
      </div>

      <RelatedProducts />
    </div>
  )
}