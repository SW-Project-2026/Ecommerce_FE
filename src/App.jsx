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
import SearchPage from './pages/SearchPage'
import './App.css'

export default function App() {
  const [page, setPage] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')

  function handleNavigate(target, payload) {
    if (target === 'search') setSearchQuery(payload)
    setPage(target)
  }

  if (page === 'login') return <LoginPage onNavigate={handleNavigate} />
  if (page === 'register') return <RegisterPage onNavigate={handleNavigate} />
  if (page === 'search') return (
    <div className="page">
      <NavHeader onNavigate={handleNavigate} />
      <SearchPage query={searchQuery} onNavigate={handleNavigate} />
      <Footer />
    </div>
  )

  return (
    <div className="page">
      <NavHeader onNavigate={handleNavigate} />
      <CategoryBar />
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
