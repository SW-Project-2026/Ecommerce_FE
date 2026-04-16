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
import './App.css'

export default function App() {
  const [page, setPage] = useState('home')

  if (page === 'login') return <LoginPage onNavigate={setPage} />
  if (page === 'register') return <RegisterPage onNavigate={setPage} />

  return (
    <div className="page">
      <NavHeader onNavigate={setPage} />
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
