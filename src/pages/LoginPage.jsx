import { useState } from 'react'
import { login } from '../api/auth'
import './auth.css'

export default function LoginPage({ onNavigate, onLogin }) {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!loginId.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력해주세요.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await login({ loginId, password })
      onLogin(data)
      onNavigate('home')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left auth-left--login">
        <div className="auth-deco-circle auth-deco-circle--outline" style={{ width: 420, height: 420, top: -90, right: -120 }} />
        <div className="auth-deco-circle auth-deco-circle--rose"    style={{ width: 280, height: 280, bottom: 30, left: -90 }} />
        <div className="auth-brand" onClick={() => onNavigate('home')}>
          <div className="auth-brand-name">Da-On</div>
          <div className="auth-brand-line" />
          <div className="auth-brand-tagline">where taste turns on</div>
        </div>
        <div className="auth-hero">
          <h1>다시 만나서<br />반가워요 👋</h1>
          <p>지금 로그인하고<br />Da-On의 혜택을 누려보세요</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-topnav">
          계정이 없으신가요?
          <span onClick={() => onNavigate('register')}>회원가입</span>
        </div>

        <form className="auth-form-wrap" onSubmit={handleSubmit}>
          <h2>로그인</h2>
          <p>아이디와 비밀번호를 입력해 주세요</p>

          <div className="form-group">
            <label>아이디</label>
            <input
              type="text"
              placeholder="아이디를 입력하세요"
              value={loginId}
              onChange={e => setLoginId(e.target.value)}
              maxLength={20}
            />
          </div>

          <div className="form-group">
            <label>비밀번호</label>
            <div className="pw-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={e => setPassword(e.target.value)}
                maxLength={20}
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(p => !p)} aria-label="비밀번호 표시">
                <i className={showPw ? 'ri-eye-line' : 'ri-eye-off-line'} />
              </button>
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <div className="auth-divider"><span>OR</span></div>

          <p className="terms-notice">
            로그인 시 Da-On의 이용약관 및 개인정보처리방침에 동의하는 것으로 간주합니다
          </p>

          <div className="social-row">
            <button type="button" className="btn-social btn-google">
              <i className="ri-google-fill" /> Google로 로그인
            </button>
            <button type="button" className="btn-social btn-kakao">
              💬 카카오로 로그인
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
