import { useState, useEffect } from 'react'
import NavHeader from './components/layout/NavHeader'
import CategoryBar from './components/layout/CategoryBar'
import Footer from './components/layout/Footer'
import HeroBanner from './components/sections/HeroBanner'
import RecommendSection from './components/sections/RecommendSection'
import PurchasedSection from './components/sections/PurchasedSection'
import RecentViewedSection from './components/sections/RecentViewedSection'
import BestSection from './components/sections/BestSection'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProductListPage from './pages/ProductListPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderCompletePage from './pages/OrderCompletePage'
import MyPage from './pages/MyPage'
import WithdrawPage from './pages/WithdrawPage'
import CouponPopup from './components/CouponPopup'
import CouponClaimPage from './pages/CouponClaimPage'
import PromotionCouponPage from './pages/PromotionCouponPage'
import { usePageView } from './hooks/usePageView'
import { getMyProfile } from './api/users'
import { refreshToken } from './api/auth'
import { cartGet } from './api/carts'
import { userLogin as snippetUserLogin, getOrCreateUUID } from './api/snippets'
import { getHome, getHomeByUser } from './api/home'
import { wishlistGet } from './api/wishlists'
import './App.css'

const FLUENTD_URL = import.meta.env.VITE_FLUENTD_URL || 'https://fluentd.daon.site'

function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`
}

function removeCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
}

function clearAuth() {
  removeCookie('accessToken')
  localStorage.removeItem('role')
  localStorage.removeItem('userId')
  localStorage.removeItem('userSeqId')
  sessionStorage.clear()
}

export default function App() {
  const [page, setPage] = useState(() => {
    if (window.location.pathname === '/coupon/claim') return 'coupon-claim'
    return sessionStorage.getItem('page') || 'home'
  })
  const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('searchQuery') || '')
  const [category, setCategory] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('category')) || { id: 'all', label: '전체' } }
    catch { return { id: 'all', label: '전체' } }
  })
  const [productId, setProductId] = useState(() => sessionStorage.getItem('productId') || null)
  const [prevCategory, setPrevCategory] = useState(null)
  const [cart, setCart] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [orderInfo, setOrderInfo] = useState(null)
  const [checkoutItems, setCheckoutItems] = useState([])
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  const [mypageTab, setMypageTab] = useState(() => sessionStorage.getItem('mypageTab') || 'home')
  const [auth, setAuth] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [homeData, setHomeData] = useState(null)
  const [wishMap, setWishMap] = useState({})
  const [couponPopup, setCouponPopup] = useState(null)
  const [promotionCouponId, setPromotionCouponId] = useState(null)

  useEffect(() => {
    async function initAuth() {
      const role   = localStorage.getItem('role')
      const userId = localStorage.getItem('userId')

      if (!role) {
        setAuthLoading(false)
        return
      }

      try {
        const data = await refreshToken()
        if (data?.role) localStorage.setItem('role', data.role)
        const resolvedRole = data?.role ?? role
        if (resolvedRole === 'ADMIN') {
          window.location.href = '/#admin'
          window.location.reload()
          return
        }
        setAuth({ role: resolvedRole, userId: userId ?? null })
        if (!localStorage.getItem('userSeqId')) {
          getMyProfile().then(profile => {
            if (profile?.id) localStorage.setItem('userSeqId', String(profile.id))
          }).catch(() => {})
        }
      } catch {
        clearAuth()
        setAuth(null)
      } finally {
        setAuthLoading(false)
      }
    }

    initAuth()
  }, [])

  useEffect(() => {
    if (!auth) { setWishMap({}); return }
    wishlistGet({ size: 100 })
      .then(data => {
        const map = {}
        ;(data.content ?? []).forEach(w => { map[w.productId] = w.wishId })
        setWishMap(map)
      })
      .catch(() => {})
  }, [auth])

  useEffect(() => {
    if (page !== 'home') return
    if (authLoading) return
    const userSeqId = localStorage.getItem('userSeqId')
    if (userSeqId) {
      getHomeByUser({ userId: userSeqId })
        .then(data => setHomeData(data))
        .catch(() => {
          getHome().then(data => setHomeData(data)).catch(() => {})
        })
    } else {
      getHome().then(data => setHomeData(data)).catch(() => {})
    }
  }, [page, auth, authLoading])

  // ── 회원가입 유도 쿠폰 팝업: 가입 완료 후 동일 쿠폰 팝업 재표시 ──
  useEffect(() => {
    if (authLoading || !auth) return
    let saved = null
    try {
      const raw = sessionStorage.getItem('pendingCouponPopup')
      if (raw) saved = JSON.parse(raw)
    } catch {}
    if (saved?.couponId) {
      setCouponPopup(saved)
    }
    sessionStorage.removeItem('pendingCouponPopup')
  }, [auth, authLoading])

  // ── 쿠폰 팝업: pending 조회 ──
  useEffect(() => {
    if (authLoading) return
    const userSeqId = localStorage.getItem('userSeqId')
    const query = (auth && userSeqId)
      ? `userId=${userSeqId}`
      : `clientUuid=${getOrCreateUUID()}`

    fetch(`${FLUENTD_URL}/api/notifications/pending?${query}`)
      .then(res => res.json())
      .then(list => {
        if (Array.isArray(list) && list.length > 0) {
          const first = list[0]
          if (first.couponId) {
            setCouponPopup({
              couponId:          first.couponId          ?? null,
              campaignId:        first.campaignId        ?? null,
              couponName:        first.couponName        ?? null,
              discountType:      first.discountType      ?? null,
              discountAmount:    first.discountAmount    ?? null,
              minOrderAmount:    first.minOrderAmount    ?? null,
              maxDiscountAmount: first.maxDiscountAmount ?? null,
            })
          }
          fetch(`${FLUENTD_URL}/api/notifications/pending?${query}`, { method: 'DELETE' })
            .catch(() => {})
        }
      })
      .catch(() => {})
  }, [auth, authLoading])

  // ── 쿠폰 팝업: SSE 연결 ──
  useEffect(() => {
    if (authLoading) return
    const userSeqId = localStorage.getItem('userSeqId')
    const query = (auth && userSeqId)
      ? `userId=${userSeqId}`
      : `clientUuid=${getOrCreateUUID()}`

    const es = new EventSource(`${FLUENTD_URL}/api/notifications/stream?${query}`)

    es.addEventListener('campaign', (e) => {
      try {
        const data = JSON.parse(e.data)

        if (data.couponId) {
          setCouponPopup({
            couponId:          data.couponId          ?? null,
            campaignId:        data.campaignId        ?? null,
            couponName:        data.couponName        ?? null,
            discountType:      data.discountType      ?? null,
            discountAmount:    data.discountAmount    ?? null,
            minOrderAmount:    data.minOrderAmount    ?? null,
            maxDiscountAmount: data.maxDiscountAmount ?? null,
          })
        }
      } catch (err) {
        console.error('SSE 이벤트 파싱 오류', err)
      }
    })

    es.onerror = () => {
      es.close()
    }

    return () => {
      es.close()
    }
  }, [auth, authLoading])

  useEffect(() => {
    if (!auth) { setCartCount(0); return }
    fetchCartCount()
  }, [auth])

  async function fetchCartCount() {
    try {
      const data = await cartGet()
      const list = Array.isArray(data) ? data : []
      setCartCount(list.reduce((s, i) => s + (i.quantity ?? 1), 0))
    } catch {
      setCartCount(0)
    }
  }

  usePageView(page === 'home' ? '홈' : null)

  async function handleLogin(data) {
    setCookie('accessToken', data.accessToken)
    localStorage.setItem('role', data.role)

    try {
      const profile = await getMyProfile()
      const userId = profile.loginId ?? null
      const userSeqId = profile.id ?? null
      if (userId) localStorage.setItem('userId', userId)
      if (userSeqId) localStorage.setItem('userSeqId', String(userSeqId))
      setAuth({ role: data.role, userId })
      if (data.role !== 'ADMIN') {
        snippetUserLogin({ userId })
      }
    } catch {
      setAuth({ role: data.role, userId: null })
    }

    if (data.role === 'ADMIN') {
      window.location.href = '/#admin'
      window.location.reload()
    } else {
      sessionStorage.setItem('page', 'home')
      window.location.reload()
    }
  }

  function handleLogout() {
    clearAuth()
    setAuth(null)
    setCartCount(0)
    setCouponPopup(null)
    setHomeData(null)
    setWishMap({})
    sessionStorage.setItem('page', 'home')
    window.location.reload()
  }

  function handleAddToCart(product, qty = 1) {
    setCart(prev => {
      const existing = prev.find(i => i.product.productId === product.productId)
      if (existing) {
        return prev.map(i =>
          i.product.productId === product.productId
            ? { ...i, qty: i.qty + qty }
            : i
        )
      }
      return [...prev, { product, qty }]
    })
    fetchCartCount()
  }

  function handleGoCheckout({ items, coupon }) {
    setCheckoutItems(items)
    setSelectedCoupon(coupon)
    setPage('checkout')
  }

  function handleNavigate(target, payload) {
    if (target === 'search') {
      setSearchQuery(payload)
      setCategory({ id: 'all', label: '전체' })
      sessionStorage.setItem('searchQuery', payload)
      sessionStorage.setItem('category', JSON.stringify({ id: 'all', label: '전체' }))
    }
    if (target === 'list') {
      setCategory(payload)
      setSearchQuery('')
      sessionStorage.setItem('category', JSON.stringify(payload))
      sessionStorage.setItem('searchQuery', '')
    }
    if (target === 'home') {
      setSearchQuery('')
      setCategory({ id: 'all', label: '전체' })
      sessionStorage.setItem('searchQuery', '')
      sessionStorage.setItem('category', JSON.stringify({ id: 'all', label: '전체' }))
    }
    if (target === 'product') {
      setPrevCategory(page === 'list' ? category : null)
      setProductId(payload)
      sessionStorage.setItem('productId', payload)
    }
    if (target === 'promotion-coupon') {
      setPromotionCouponId(payload)
    }
    if (target === 'mypage') {
      setMypageTab(payload ?? 'home')
      sessionStorage.setItem('mypageTab', payload ?? 'home')
    }
    if (target === 'cart' || target === 'home') {
      fetchCartCount()
    }
    if (page === 'register' && target !== 'register') {
      sessionStorage.removeItem('pendingCouponPopup')
    }
    window.scrollTo(0, 0)
    sessionStorage.setItem('page', target)
    setPage(target)
  }

  const userId = auth?.userId ?? null

  if (authLoading && page !== 'coupon-claim') return null

  return (
    <>
      {couponPopup?.couponId && (
        <CouponPopup
          coupon={{
            couponId:          couponPopup.couponId,
            couponName:        couponPopup.couponName,
            discountType:      couponPopup.discountType,
            discountAmount:    couponPopup.discountAmount,
            minOrderAmount:    couponPopup.minOrderAmount,
            maxDiscountAmount: couponPopup.maxDiscountAmount,
          }}
          userId={userId}
          isLoggedIn={!!auth}
          onNavigate={handleNavigate}
          onClose={() => setCouponPopup(null)}
          onDismiss={() => setCouponPopup(null)}
        />
      )}

      {page === 'promotion-coupon' && (
        <div className="page page-list">
          <NavHeader onNavigate={handleNavigate} cartCount={cartCount} auth={auth} onLogout={handleLogout} userId={userId} />
          <PromotionCouponPage couponId={promotionCouponId} onNavigate={handleNavigate} userId={userId} />
          <Footer />
        </div>
      )}

      {page === 'coupon-claim' && <CouponClaimPage />}

      {page === 'cart' && (
        <div className="page page-list">
          <NavHeader onNavigate={handleNavigate} cartCount={cartCount} auth={auth} onLogout={handleLogout} userId={userId} />
          <CartPage cart={cart} onNavigate={handleNavigate} onCartChange={setCart} onGoCheckout={handleGoCheckout} auth={auth} onCartCountChange={fetchCartCount} />
          <Footer />
        </div>
      )}

      {page === 'checkout' && (
        <div className="page page-list">
          <NavHeader onNavigate={handleNavigate} cartCount={cartCount} auth={auth} onLogout={handleLogout} userId={userId} />
          <CheckoutPage checkoutItems={checkoutItems} selectedCoupon={selectedCoupon} onNavigate={handleNavigate} onOrderComplete={info => { setOrderInfo(info); fetchCartCount() }} auth={auth} />
          <Footer />
        </div>
      )}

      {page === 'mypage' && (
        <div className="page page-list">
          <NavHeader onNavigate={handleNavigate} cartCount={cartCount} auth={auth} onLogout={handleLogout} userId={userId} />
          <MyPage key={mypageTab} onNavigate={handleNavigate} onLogout={handleLogout} auth={auth} userId={userId} initialTab={mypageTab} />
          <Footer />
        </div>
      )}

      {page === 'order-complete' && (
        <div className="page page-list">
          <NavHeader onNavigate={handleNavigate} cartCount={0} auth={auth} onLogout={handleLogout} userId={userId} />
          <OrderCompletePage orderInfo={orderInfo} onNavigate={handleNavigate} userId={userId} />
          <Footer />
        </div>
      )}

      {page === 'product' && (
        <div className="page page-list">
          <NavHeader onNavigate={handleNavigate} cartCount={cartCount} auth={auth} onLogout={handleLogout} userId={userId} />
          <CategoryBar onNavigate={handleNavigate} activeCategory={category.id} />
          <ProductDetailPage productId={productId} onNavigate={handleNavigate} prevCategory={prevCategory} onAddToCart={handleAddToCart} userId={userId} auth={auth} />
          <Footer />
        </div>
      )}

      {page === 'login' && <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />}
      {page === 'register' && <RegisterPage onNavigate={handleNavigate} onLogin={handleLogin} />}

      {page === 'withdraw' && (
        <div className="page page-list">
          <NavHeader onNavigate={handleNavigate} cartCount={cartCount} auth={auth} onLogout={handleLogout} userId={userId} />
          <WithdrawPage onNavigate={handleNavigate} onLogout={handleLogout} userId={userId} />
          <Footer />
        </div>
      )}

      {(page === 'search' || page === 'list') && (
        <div className="page page-list">
          <NavHeader onNavigate={handleNavigate} cartCount={cartCount} auth={auth} onLogout={handleLogout} userId={userId} />
          <CategoryBar onNavigate={handleNavigate} activeCategory={category.id} />
          <ProductListPage query={searchQuery} category={category} onNavigate={handleNavigate} userId={userId} auth={auth} />
          <Footer />
        </div>
      )}

      {page === 'home' && (
        <div className="page">
          <NavHeader onNavigate={handleNavigate} cartCount={cartCount} auth={auth} onLogout={handleLogout} userId={userId} />
          <CategoryBar onNavigate={handleNavigate} activeCategory="home" />
          <HeroBanner
            promotions={homeData?.promotions ?? []}
            userName={homeData?.userName ?? ''}
            onNavigate={handleNavigate}
            adBanners={homeData?.adBanners ?? []}
            auth={auth}
            userId={userId}
            onPromotionClick={(couponId) => {
              if (!auth) { handleNavigate('login'); return }
              handleNavigate('promotion-coupon', couponId)
            }}
          />
          <RecommendSection
            onNavigate={handleNavigate}
            auth={auth}
            products={homeData?.recommendedProducts ?? []}
            wishMap={wishMap}
            setWishMap={setWishMap}
          />
          <RecentViewedSection
            onNavigate={handleNavigate}
            auth={auth}
            products={auth ? (homeData?.recentViewedProducts ?? []) : []}
            wishMap={wishMap}
            setWishMap={setWishMap}
          />
          <PurchasedSection
            onNavigate={handleNavigate}
            auth={auth}
            products={auth ? (homeData?.purchasedProducts ?? []) : []}
            wishMap={wishMap}
            setWishMap={setWishMap}
          />
          <BestSection
            onNavigate={handleNavigate}
            auth={auth}
            products={homeData?.bestProducts ?? []}
            wishMap={wishMap}
            setWishMap={setWishMap}
          />
          <Footer />
        </div>
      )}
    </>
  )
}