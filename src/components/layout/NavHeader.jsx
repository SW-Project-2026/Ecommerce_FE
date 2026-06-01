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

      {/* 장바구니 */}
      <div className="cart-wrap" onClick={() => onNavigate('cart')} style={{ cursor: 'pointer' }}>
        <span className="cart-label">장바구니</span>
        {cartCount > 0 && <div className="cart-badge">{cartCount}</div>}
      </div>

      {/* 찜 */}
      <div
        onClick={() => onNavigate('mypage', 'wishlist')}
        style={{
          position: 'absolute',
          left: 945,
          top: 24,
          fontSize: 12,
          color: '#666666',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        찜
      </div>

      {/* 마이페이지 */}
      <div
        onClick={() => onNavigate('mypage')}
        style={{
          position: 'absolute',
          left: 1005,
          top: 24,
          fontSize: 12,
          color: '#666666',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        마이페이지
      </div>

      {auth ? (
        <>
          {/* userId님 - 로그아웃 바로 왼쪽 */}
          {userId && (
            <div style={{
              position: 'absolute',
              left: 1185,
              top: 24,
              fontSize: 12,
              color: '#333333',
              whiteSpace: 'nowrap',
              fontFamily: "'Inter', sans-serif",
            }}>
              {userId}님
            </div>
          )}
          <div className="login-btn" onClick={onLogout} style={{ cursor: 'pointer' }}>로그아웃</div>
        </>
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