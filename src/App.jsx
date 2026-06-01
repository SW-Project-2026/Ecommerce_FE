import { useState, useEffect } from 'react'
import NavHeader from './components/layout/NavHeader'
import CategoryBar from './components/layout/CategoryBar'
import Footer from './components/layout/Footer'
import HeroBanner from './components/sections/HeroBanner'
import RecommendSection from './components/sections/RecommendSection'
import AdBanner from './components/sections/AdBanner'
import RepurchaseSection from './components/sections/RepurchaseSection'
import TimeBasedSection from './components/sections/TimeBasedSection'
import BestSection from './components/sections/BestSection'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProductListPage from './pages/ProductListPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderCompletePage from './pages/OrderCompletePage'
import MyPage from './pages/MyPage'
import { usePageView } from './hooks/usePageView'
import { getMyProfile } from './api/users'
import { refreshToken } from './api/auth'
import './App.css'

// ── JWT payload 디코딩 (만료 체크용) ──
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

function clearAuth() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('role')
  localStorage.removeItem('userId')
  sessionStorage.clear()
}

export default function App() {
  const [page, setPage] = useState(() => sessionStorage.getItem('page') || 'home')
  const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('searchQuery') || '')
  const [category, setCategory] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('category')) || { id: 'all', label: '전체' } }
    catch { return { id: 'all', label: '전체' } }
  })
  const [productId, setProductId] = useState(() => sessionStorage.getItem('productId') || null)
  const [prevCategory, setPrevCategory] = useState(null)
  const [cart, setCart] = useState([])
  const [orderInfo, setOrderInfo] = useState(null)
  const [checkoutItems, setCheckoutItems] = useState([])
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  const [mypageTab, setMypageTab] = useState(() => sessionStorage.getItem('mypageTab') || 'home')

  // ── auth 초기값: null로 시작하고 useEffect에서 비동기 체크 ──
  const [auth, setAuth] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem('accessToken')
      const role = localStorage.getItem('role')
      const userId = localStorage.getItem('userId')

      // 토큰 없으면 비로그인
      if (!token) {
        setAuthLoading(false)
        return
      }

      // 토큰 유효하면 그대로 사용
      if (!isTokenExpired(token)) {
        setAuth({ token, role, userId: userId ?? null })
        setAuthLoading(false)
        return
      }

      // 토큰 만료 → refresh 시도
      try {
        const data = await refreshToken()
        if (data?.accessToken) {
          localStorage.setItem('accessToken', data.accessToken)
          if (data.role) localStorage.setItem('role', data.role)
          setAuth({ token: data.accessToken, role: data.role ?? role, userId: userId ?? null })
        }
      } catch {
        // refresh 실패(refresh token도 만료 등) → 로그아웃
        clearAuth()
        setAuth(null)
      } finally {
        setAuthLoading(false)
      }
    }

    initAuth()
  }, [])

  usePageView(page === 'home' ? '홈' : null)

  async function handleLogin(data) {
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('role', data.role)
    setAuth({ token: data.accessToken, role: data.role, userId: null })

    try {
      const profile = await getMyProfile()
      const userId = profile.loginId ?? null
      if (userId) localStorage.setItem('userId', userId)
      setAuth({ token: data.accessToken, role: data.role, userId })
    } catch {
      // userId 없이 진행
    }

    if (data.role === 'ADMIN') {
      window.location.href = '/#admin'
      window.location.reload()
    }
  }

  function handleLogout() {
    clearAuth()
    setAuth(null)
    setPage('home')
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
    if (target === 'mypage') {
      setMypageTab(payload ?? 'home')
      sessionStorage.setItem('mypageTab', payload ?? 'home')
    }
    sessionStorage.setItem('page', target)
    setPage(target)
  }

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const userId = auth?.userId ?? null

  // auth 체크 중에는 빈 화면 (깜빡임 방지)
  if (authLoading) return null

  if (page === 'cart') return (
    <div className="page page-list">
      <NavHeader onNavigate={handleNavigate} cartCount={cartCount} auth={auth} onLogout={handleLogout} userId={userId} />
      <CartPage
        cart={cart}
        onNavigate={handleNavigate}
        onCartChange={setCart}
        onGoCheckout={handleGoCheckout}
        auth={auth}
      />
      <Footer />
    </div>
  )

  if (page === 'checkout') return (
    <div className="page page-list">
      <NavHeader onNavigate={handleNavigate} cartCount={cartCount} auth={auth} onLogout={handleLogout} userId={userId} />
      <CheckoutPage
        checkoutItems={checkoutItems}
        selectedCoupon={selectedCoupon}
        onNavigate={handleNavigate}
        onOrderComplete={info => setOrderInfo(info)}
        auth={auth}
      />
      <Footer />
    </div>
  )

  if (page === 'mypage') return (
    <div className="page page-list">
      <NavHeader onNavigate={handleNavigate} cartCount={cartCount} auth={auth} onLogout={handleLogout} userId={userId} />
      <MyPage onNavigate={handleNavigate} auth={auth} userId={userId} initialTab={mypageTab} />
      <Footer />
    </div>
  )

  if (page === 'order-complete') return (
    <div className="page page-list">
      <NavHeader onNavigate={handleNavigate} cartCount={0} auth={auth} onLogout={handleLogout} userId={userId} />
      <OrderCompletePage orderInfo={orderInfo} onNavigate={handleNavigate} userId={userId} />
      <Footer />
    </div>
  )

  if (page === 'product') return (
    <div className="page page-list">
      <NavHeader onNavigate={handleNavigate} cartCount={cartCount} auth={auth} onLogout={handleLogout} userId={userId} />
      <CategoryBar onNavigate={handleNavigate} activeCategory={category.id} />
      <ProductDetailPage
        productId={productId}
        onNavigate={handleNavigate}
        prevCategory={prevCategory}
        onAddToCart={handleAddToCart}
        userId={userId}
      />
      <Footer />
    </div>
  )

  if (page === 'login') return <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />
  if (page === 'register') return <RegisterPage onNavigate={handleNavigate} onLogin={handleLogin} />

  if (page === 'search' || page === 'list') return (
    <div className="page page-list">
      <NavHeader onNavigate={handleNavigate} cartCount={cartCount} auth={auth} onLogout={handleLogout} userId={userId} />
      <CategoryBar onNavigate={handleNavigate} activeCategory={category.id} />
      <ProductListPage
        query={searchQuery}
        category={category}
        onNavigate={handleNavigate}
        userId={userId}
      />
      <Footer />
    </div>
  )

  return (
    <div className="page">
      <NavHeader onNavigate={handleNavigate} cartCount={cartCount} auth={auth} onLogout={handleLogout} userId={userId} />
      <CategoryBar onNavigate={handleNavigate} activeCategory="home" />
      <HeroBanner />
      <RecommendSection />
      <AdBanner />
      <RepurchaseSection />
      <TimeBasedSection />
      <BestSection />
      <Footer />
    </div>
  )
}