import { useState } from 'react'
import MyHome from '../components/mypage/MyHome'
import MyOrderList from '../components/mypage/MyOrderList'
import MyWishlist from '../components/mypage/MyWishlist'
import MyCoupons from '../components/mypage/MyCoupons'
import MyProfileEdit from '../components/mypage/MyProfileEdit'
import { usePageView } from '../hooks/usePageView'
import './mypage.css'

const MENU = [
  { key: 'home',     label: '마이홈',    icon: 'ri-home-4-line' },
  { key: 'orders',   label: '주문 내역', icon: 'ri-file-list-3-line' },
  { key: 'wishlist', label: '찜한 상품', icon: 'ri-heart-line' },
  { key: 'coupons',  label: '쿠폰함',    icon: 'ri-coupon-3-line' },
  { key: 'profile',  label: '내 정보',   icon: 'ri-user-settings-line' },
]

const USER = { name: '김다온', grade: 'GOLD', coupons: 3 }

export default function MyPage({ onNavigate, userId = null }) {
  usePageView('마이페이지', userId)

  const [tab, setTab] = useState('home')

  function handleTabNavigate(target, payload) {
    if (target === 'orders' || target === 'wishlist' || target === 'coupons' || target === 'profile') {
      setTab(target)
    } else {
      onNavigate(target, payload)
    }
  }

  return (
    <div className="myp-outer">
      <aside className="myp-sidebar">
        <div className="myp-sb-profile">
          <div className="myp-sb-avatar">{USER.name[0]}</div>
          <div className="myp-sb-name">{USER.name}님</div>
          <span className="myp-sb-grade">⭐ {USER.grade}</span>
          <div className="myp-sb-stats">
            <div>
              <div className="myp-sb-stat-val">{USER.coupons}장</div>
              <div className="myp-sb-stat-label">쿠폰</div>
            </div>
          </div>
        </div>

        <nav className="myp-sb-menu">
          {MENU.map(m => (
            <div key={m.key} className={`myp-sb-menu-item${tab === m.key ? ' active' : ''}`} onClick={() => setTab(m.key)}>
              <i className={m.icon} />
              {m.label}
            </div>
          ))}
          <div className="myp-sb-menu-item myp-sb-logout" onClick={() => onNavigate('home')}>
            <i className="ri-logout-box-r-line" />
            로그아웃
          </div>
        </nav>
      </aside>

      <main className="myp-content">
        {tab === 'home'     && <MyHome      onNavigate={handleTabNavigate} />}
        {tab === 'orders'   && <MyOrderList />}
        {tab === 'wishlist' && <MyWishlist   onNavigate={handleTabNavigate} />}
        {tab === 'coupons'  && <MyCoupons />}
        {tab === 'profile'  && <MyProfileEdit />}
      </main>
    </div>
  )
}