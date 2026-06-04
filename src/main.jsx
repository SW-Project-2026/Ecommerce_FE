import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import CampaignListPage from './pages/CampaignListPage'
import CouponClaimPage from './pages/CouponClaimPage'

function getCookie(name) {
  return document.cookie.split('; ').reduce((acc, part) => {
    const [k, v] = part.split('=')
    return k === name ? decodeURIComponent(v) : acc
  }, null)
}

const isAdminHash  = window.location.hash === '#admin'
const role         = localStorage.getItem('role')
const token        = getCookie('accessToken')
const hasCouponToken = new URLSearchParams(window.location.search).has('token')

// /#admin 해시이거나, role이 ADMIN이면 관리자 페이지 진입
const isAdmin = isAdminHash || (token && role === 'ADMIN')

if (isAdmin && !isAdminHash) {
  window.location.hash = '#admin'
}

let root
if (hasCouponToken) {
  root = <CouponClaimPage />
} else if (isAdmin) {
  root = <CampaignListPage />
} else {
  root = <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>{root}</StrictMode>
)