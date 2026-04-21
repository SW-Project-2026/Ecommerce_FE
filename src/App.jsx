import { useState } from 'react'
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
import './App.css'

export default function App() {
  const [page, setPage] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState({ id: 'all', label: '전체' })
  const [productId, setProductId] = useState(null)
  const [prevCategory, setPrevCategory] = useState(null)
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('accessToken')
    const role = localStorage.getItem('role')
    return token ? { token, role } : null
  })

  function handleLogin(data) {
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('role', data.role)
    setAuth({ token: data.accessToken, role: data.role })
  }

  function handleLogout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('role')
    setAuth(null)
    setPage('home')
  }

  function handleNavigate(target, payload) {
    if (target === 'search') {
      setSearchQuery(payload)
      setCategory({ id: 'all', label: '전체' })
    }
    if (target === 'list') {
      setCategory(payload)
      setSearchQuery('')
    }
    if (target === 'home') {
      setSearchQuery('')
      setCategory({ id: 'all', label: '전체' })
    }
    if (target === 'product') {
      setPrevCategory(page === 'list' ? category : null)
      setProductId(payload)
    }
    setPage(target)
  }

  if (page === 'product') return (
    <div className="page page-list">
      <NavHeader onNavigate={handleNavigate} />
      <CategoryBar onNavigate={handleNavigate} activeCategory={category.id} />
      <ProductDetailPage
        productId={productId}
        onNavigate={handleNavigate}
        prevCategory={prevCategory}
      />
      <Footer />
    </div>
  )

  if (page === 'login') return <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />
  if (page === 'register') return <RegisterPage onNavigate={handleNavigate} onLogin={handleLogin} />

  if (page === 'search' || page === 'list') return (
    <div className="page page-list">
      <NavHeader onNavigate={handleNavigate} />
      <CategoryBar onNavigate={handleNavigate} activeCategory={category.id} />
      <ProductListPage
        query={searchQuery}
        category={category}
        onNavigate={handleNavigate}
      />
      <Footer />
    </div>
  )

  return (
    <div className="page">
      <NavHeader onNavigate={handleNavigate} />
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
