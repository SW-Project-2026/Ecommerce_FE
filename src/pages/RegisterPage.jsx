import { useState } from 'react'
import { signup } from '../api/auth'
import './auth.css'

export default function RegisterPage({ onNavigate, onLogin }) {
  const [form, setForm] = useState({
    name: '', loginId: '', email: '',
    phone: '', password: '', passwordConfirm: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [showPwConfirm, setShowPwConfirm] = useState(false)
  const [agreements, setAgreements] = useState({
    all: false, terms: false, privacy: false, marketing: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function updateForm(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function toggleAll() {
    const next = !agreements.all
    setAgreements({ all: next, terms: next, privacy: next, marketing: next })
  }

  function toggleAgreement(key) {
    const updated = { ...agreements, [key]: !agreements[key] }
    updated.all = updated.terms && updated.privacy && updated.marketing
    setAgreements(updated)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!agreements.terms || !agreements.privacy) {
      setError('필수 약관에 동의해주세요.')
      return
    }
    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않아요.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const phone = form.phone.replace(/-/g, '')
      const data = await signup({ ...form, loginId: form.loginId, phone })
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
      {/* ── 왼쪽 패널 ── */}
      <div className="auth-left auth-left--register">
        <div className="auth-deco-circle" style={{ width: 420, height: 420, top: -120, right: -100 }} />
        <div className="auth-deco-circle" style={{ width: 260, height: 260, bottom: 60, left: -80 }} />

        <div className="auth-brand" onClick={() => onNavigate('home')}>
          <div className="auth-brand-name">Da-On</div>
          <div className="auth-brand-line" />
          <div className="auth-brand-tagline">where taste turns on</div>
        </div>
        <div className="auth-hero">
          <h1>새로운 시작,<br />Da-On와 함께 ✨</h1>
          <p>회원가입하고 AI 맞춤 추천과<br />특별한 혜택을 경험해보세요</p>
          <div className="benefit-list">
            <div className="benefit-item">🎁 신규 가입 쿠폰 5,000원</div>
            <div className="benefit-item">✨ 맞춤 상품 추천</div>
            <div className="benefit-item">📧 재구매 알림 서비스</div>
          </div>
        </div>
      </div>

      {/* ── 오른쪽 패널 ── */}
      <div className="auth-right">
        <div className="auth-topnav">
          이미 계정이 있으신가요?
          <span onClick={() => onNavigate('login')}>로그인</span>
        </div>

        <form className="auth-form-wrap auth-form-wrap--register" onSubmit={handleSubmit}>
          <h2>회원가입</h2>
          <p className="form-subtitle">여러 정보를 입력하여 계정을 만들어보세요</p>

          <div className="form-row">
            <div className="form-group">
              <label>이름</label>
              <input
                type="text"
                placeholder="홍길동"
                value={form.name}
                onChange={e => updateForm('name', e.target.value)}
                maxLength={20}
              />
            </div>
            <div className="form-group">
              <label>아이디</label>
              <input
                type="text"
                placeholder="ID"
                value={form.loginId}
                onChange={e => updateForm('loginId', e.target.value)}
                maxLength={20}
              />
            </div>
          </div>

          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              placeholder="example@shopnow.com"
              value={form.email}
              onChange={e => updateForm('email', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>휴대폰 번호</label>
            <input
              type="tel"
              placeholder="010-0000-0000"
              value={form.phone}
              onChange={e => updateForm('phone', e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>비밀번호</label>
              <div className="pw-wrap">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="8자 이상 20자 이하 입력"
                  value={form.password}
                  onChange={e => updateForm('password', e.target.value)}
                />
                <button className="pw-toggle" onClick={() => setShowPw(p => !p)} aria-label="비밀번호 표시">
                  <i className={showPw ? 'ri-eye-line' : 'ri-eye-off-line'} />
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>비밀번호 확인</label>
              <div className="pw-wrap">
                <input
                  type={showPwConfirm ? 'text' : 'password'}
                  placeholder="재입력"
                  value={form.passwordConfirm}
                  onChange={e => updateForm('passwordConfirm', e.target.value)}
                />
                <button className="pw-toggle" onClick={() => setShowPwConfirm(p => !p)} aria-label="비밀번호 확인 표시">
                  <i className={showPwConfirm ? 'ri-eye-line' : 'ri-eye-off-line'} />
                </button>
              </div>
            </div>
          </div>

          <div className="agreement-section">
            <div className="agreement-all" onClick={toggleAll}>
              <input
                type="checkbox"
                checked={agreements.all}
                onChange={toggleAll}
                onClick={e => e.stopPropagation()}
              />
              전체 동의
            </div>
            <div className="agreement-item" onClick={() => toggleAgreement('terms')}>
              <input
                type="checkbox"
                checked={agreements.terms}
                onChange={() => toggleAgreement('terms')}
                onClick={e => e.stopPropagation()}
              />
              [필수] 이용약관 동의
            </div>
            <div className="agreement-item" onClick={() => toggleAgreement('privacy')}>
              <input
                type="checkbox"
                checked={agreements.privacy}
                onChange={() => toggleAgreement('privacy')}
                onClick={e => e.stopPropagation()}
              />
              [필수] 개인정보 수집·이용 동의
            </div>
            <div className="agreement-item" onClick={() => toggleAgreement('marketing')}>
              <input
                type="checkbox"
                checked={agreements.marketing}
                onChange={() => toggleAgreement('marketing')}
                onClick={e => e.stopPropagation()}
              />
              [선택] 마케팅 정보 수신 동의
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? '가입 중...' : '회원가입 완료'}
          </button>

          <p className="terms-notice" style={{ marginTop: 14 }}>
            가입 시 Da-On 서비스약관 및 개인정보처리방침에 동의하는 것으로 간주합니다
          </p>
        </form>
      </div>
    </div>
  )
}
