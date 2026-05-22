import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import CampaignListPage from './pages/CampaignListPage'

const isAdmin = window.location.hash === '#admin'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdmin ? <CampaignListPage /> : <App />}
  </StrictMode>
)