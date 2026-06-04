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
import WithdrawPage from './pages/WithdrawPage'
import { usePageView } from './hooks/usePageView'
import { getMyProfile } from './api/users'
import { refreshToken } from './api/auth'
import { cartGet } from './api/carts'
import './App.css'

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
  const [cartCount, setCartCount] = useState(0)
  const [orderInfo, setOrderInfo] = useState(null)
  const [checkoutItems, setCheckoutItems] = useState([])
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  const [mypageTab, setMypageTab] = useState(() => sessionStorage.getItem('mypageTab') || 'home')

  const [auth, setAuth] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    async function initAuth() {
      const role   = localStorage.getItem('role')
      const userId = localStorage.getItem('userId')

      // role이 없으면 로그인 안 된 상태
      if (!role) {
        setAuthLoading(false)
        return
      }

      // accessToken은 HttpOnly 쿠키라 JS에서 읽기 불가
      // refresh 요청으로 세션 유효 여부 확인
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
      } catch {
        clearAuth()
        setAuth(null)
      } finally {
        setAuthLoading(false)
      }
    }

    initAuth()
  }, [])

  // ── 로그인 상태일 때 실제 장바구니 개수 조회 ──
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
    setAuth({ role: data.role, userId: null })

    try {
      const profile = await getMyProfile()
      const userId = profile.loginId ?? null
      if (userId) localStorage.setItem('userId', userId)
      setAuth({ role: data.role, userId })
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
    setCartCount(0)
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
    if (target === 'mypage') {
      setMypageTab(payload ?? 'home')
      sessionStorage.setItem('mypageTab', payload ?? 'home')
    }
    if (target === 'cart' || target === 'home') {
      fetchCartCount()
    }
    sessionStorage.setItem('page', target)
    setPage(target)
  }

  const userId = auth?.userId ?? null

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
        onCartCountChange={fetchCartCount}
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
        onOrderComplete={info => { setOrderInfo(info); fetchCartCount() }}
        auth={auth}
      />
      <Footer />
    </div>
  )

  if (page === 'mypage') return (
    <div className="page page-list">
      <NavHeader onNavigate={handleNavigate} cartCount={cartCount} auth={auth} onLogout={handleLogout} userId={userId} />
      <MyPage onNavigate={handleNavigate} onLogout={handleLogout} auth={auth} userId={userId} initialTab={mypageTab} />
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
        auth={auth}
      />
      <Footer />
    </div>
  )

  if (page === 'login') return <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />
  if (page === 'register') return <RegisterPage onNavigate={handleNavigate} onLogin={handleLogin} />
  if (page === 'withdraw') return (
    <div className="page page-list">
      <NavHeader onNavigate={handleNavigate} cartCount={cartCount} auth={auth} onLogout={handleLogout} userId={userId} />
      <WithdrawPage onNavigate={handleNavigate} onLogout={handleLogout} />
      <Footer />
    </div>
  )

  if (page === 'search' || page === 'list') return (
    <div className="page page-list">
      <NavHeader onNavigate={handleNavigate} cartCount={cartCount} auth={auth} onLogout={handleLogout} userId={userId} />
      <CategoryBar onNavigate={handleNavigate} activeCategory={category.id} />
      <ProductListPage
        query={searchQuery}
        category={category}
        onNavigate={handleNavigate}
        userId={userId}
        auth={auth}
      />
      <Footer />
    </div>
  )

  return (
    <div className="page">
      <NavHeader onNavigate={handleNavigate} cartCount={cartCount} auth={auth} onLogout={handleLogout} userId={userId} />
      <CategoryBar onNavigate={handleNavigate} activeCategory="home" />
      <HeroBanner />
      <RecommendSection onNavigate={handleNavigate} auth={auth} />
      <AdBanner />
      <RepurchaseSection onNavigate={handleNavigate} auth={auth} />
      <TimeBasedSection onNavigate={handleNavigate} auth={auth} />
      <BestSection onNavigate={handleNavigate} auth={auth} />
      <Footer />
    </div>
  )
}