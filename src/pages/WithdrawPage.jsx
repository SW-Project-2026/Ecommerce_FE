import { useState } from 'react'
import { usePageView } from '../hooks/usePageView'
import './WithdrawPage.css'

export default function WithdrawPage({ onNavigate, onLogout, userId = null }) {
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [agreed,   setAgreed]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [done,     setDone]     = useState(false)

  usePageView('회원탈퇴', userId)

  async function handleWithdraw() {
    if (!password.trim()) { setError('비밀번호를 입력해 주세요.'); return }
    if (!agreed)          { setError('탈퇴 동의에 체크해 주세요.'); return }
    setError('')
    setLoading(true)
    // TODO: 탈퇴 API 연동
    setLoading(false)
    setDone(true)
  }

  if (done) {
    return (
      <div className="wd-page">
        <div className="wd-center">
          <div className="wd-card wd-card--done">
            <div className="wd-done-icon">👋</div>
            <h2 className="wd-done-title">탈퇴가 완료되었습니다</h2>
            <p className="wd-done-desc">
              그동안 Da-On을 이용해 주셔서 감사합니다.<br />
              언제든지 다시 가입하실 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="wd-page">
      <div className="wd-center">
        <h1 className="wd-title">회원 탈퇴</h1>
        <p className="wd-subtitle">탈퇴 전 아래 내용을 확인해 주세요</p>

        <div className="wd-card">
          {/* 경고 박스 */}
          <div className="wd-warn-box">
            <p className="wd-warn-title">⚠️ 탈퇴 시 아래 정보가 모두 삭제됩니다</p>
            <ul className="wd-warn-list">
              <li>주문 내역 및 배송 정보</li>
              <li>적립 포인트 및 쿠폰</li>
              <li>찜 목록 및 리뷰</li>
            </ul>
          </div>

          <div className="wd-divider" />

          {/* 본인 확인 */}
          <div className="wd-section">
            <p className="wd-section-title">본인 확인</p>
            <p className="wd-section-desc">계정 보호를 위해 현재 비밀번호를 입력해 주세요</p>
            <div className="wd-input-wrap">
              <input
                className="wd-input"
                type={showPw ? 'text' : 'password'}
                placeholder="현재 비밀번호 입력"
                value={password}
                onChange={e => setPassword(e.target.value)}
                maxLength={20}
              />
              <button
                className="wd-pw-toggle"
                type="button"
                onClick={() => setShowPw(p => !p)}
                aria-label="비밀번호 표시"
              >
                <i className={showPw ? 'ri-eye-line' : 'ri-eye-off-line'} />
              </button>
            </div>
          </div>

          {/* 동의 체크박스 */}
          <label className="wd-agree-wrap">
            <div
              className={`wd-checkbox ${agreed ? 'wd-checkbox--checked' : ''}`}
              onClick={() => setAgreed(p => !p)}
            >
              {agreed && <i className="ri-check-line" />}
            </div>
            <span className="wd-agree-text">위 내용을 모두 확인했으며, 탈퇴에 동의합니다</span>
          </label>

          {error && <p className="wd-error">{error}</p>}

          <div className="wd-divider" />

          {/* 버튼 */}
          <div className="wd-btn-row">
            <button
              className="wd-btn-cancel"
              onClick={() => onNavigate('mypage')}
              disabled={loading}
            >
              취소
            </button>
            <button
              className="wd-btn-confirm"
              onClick={handleWithdraw}
              disabled={loading || !password || !agreed}
            >
              {loading ? '처리 중...' : '회원 탈퇴'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}