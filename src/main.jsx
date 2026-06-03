import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import CampaignListPage from './pages/CampaignListPage'

function getCookie(name) {
  return document.cookie.split('; ').reduce((acc, part) => {
    const [k, v] = part.split('=')
    return k === name ? decodeURIComponent(v) : acc
  }, null)
}

const isAdminHash = window.location.hash === '#admin'
const role        = localStorage.getItem('role')
const token       = getCookie('accessToken')

// /#admin 해시이거나, 토큰+ADMIN role이 있으면 관리자 페이지 진입
const isAdmin = isAdminHash || (token && role === 'ADMIN')

if (isAdmin && !isAdminHash) {
  window.location.hash = '#admin'
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdmin ? <CampaignListPage /> : <App />}
  </StrictMode>
)