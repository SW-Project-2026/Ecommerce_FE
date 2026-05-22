import { useState } from 'react'
import { clickSearchButton } from '../../api/snippets'

export default function NavHeader({ onNavigate, cartCount = 0, auth, onLogout, userId = null }) {
  const [query, setQuery] = useState('')

  function handleSearch() {
    const trimmed = query.trim()
    if (!trimmed) return
    clickSearchButton(trimmed, userId)
    onNavigate('search', trimmed)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <header className="nav-header">
      <div className="logo" onClick={() => onNavigate('home')}>
        <div className="logo-icon">
          <span className="logo-d">D</span>
          <span className="logo-dot" />
        </div>
        <span className="logo-text">Da-On</span>
      </div>

      <div className="search-wrap">
        <input
          className="search-input"
          type="text"
          placeholder="찾고 싶은 상품을 검색해 보세요"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="search-btn" aria-label="검색" onClick={handleSearch}>
          <i className="ri-search-line" />
        </button>
      </div>

      <div className="cart-wrap" onClick={() => onNavigate('cart')} style={{ cursor: 'pointer' }}>
        <span className="cart-label">장바구니</span>
        {cartCount > 0 && <div className="cart-badge">{cartCount}</div>}
      </div>

      <div className="mypage-link" onClick={() => onNavigate('mypage')} style={{ cursor: 'pointer' }}>마이페이지</div>
      {auth ? (
        <div className="login-btn" onClick={onLogout} style={{ cursor: 'pointer' }}>로그아웃</div>
      ) : (
        <>
          <div className="login-btn" onClick={() => onNavigate('login')}>로그인</div>
          <div className="register-btn" onClick={() => onNavigate('register')}>회원가입</div>
        </>
      )}

      <div className="nav-border" />
    </header>
  )
}