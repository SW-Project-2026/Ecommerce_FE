import { useState } from 'react'
import './auth.css'

export default function LoginPage({ onNavigate }) {
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [autoLogin, setAutoLogin] = useState(false)

  return (
    <div className="auth-page">
      {/* ── 왼쪽 패널 ── */}
      <div className="auth-left auth-left--login">
        {/* 장식 원형 */}
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

      {/* ── 오른쪽 패널 ── */}
      <div className="auth-right">
        <div className="auth-topnav">
          계정이 없으신가요?
          <span onClick={() => onNavigate('register')}>회원가입</span>
        </div>

        <div className="auth-form-wrap">
          <h2>로그인</h2>
          <p>아이디와 비밀번호를 입력해 주세요</p>

          <div className="form-group">
            <label>아이디</label>
            <input
              type="text"
              placeholder="아이디를 입력하세요"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
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
              />
              <button className="pw-toggle" onClick={() => setShowPw(p => !p)} aria-label="비밀번호 표시">
                <i className={showPw ? 'ri-eye-line' : 'ri-eye-off-line'} />
              </button>
            </div>
          </div>

          <div className="form-options">
            <label>
              <input
                type="checkbox"
                checked={autoLogin}
                onChange={e => setAutoLogin(e.target.checked)}
              />
              자동 로그인
            </label>
            <span>비밀번호를 잊으셨나요?</span>
          </div>

          <button className="btn-primary">로그인</button>

          <div className="auth-divider"><span>OR</span></div>

          <p className="terms-notice">
            로그인 시 Da-On의 이용약관 및 개인정보처리방침에 동의하는 것으로 간주합니다
          </p>

          <div className="social-row">
            <button className="btn-social btn-google">
              <i className="ri-google-fill" /> Google로 로그인
            </button>
            <button className="btn-social btn-kakao">
              💬 카카오로 로그인
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
