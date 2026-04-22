import { useState } from 'react'

export default function MyProfileEdit() {
  const [form, setForm] = useState({
    name: '김다온',
    loginId: 'daon123',
    email: 'daon@example.com',
    phone: '010-1234-5678',
    newPw: '',
    confirmPw: '',
  })
  const [saved, setSaved] = useState(false)

  function handleChange(field, val) {
    setForm(prev => ({ ...prev, [field]: val }))
    setSaved(false)
  }

  function handleSave(e) {
    e.preventDefault()
    setSaved(true)
  }

  return (
    <>
      <div className="myp-section">
        <div className="myp-section-title">
          <i className="ri-user-settings-line" />
          내 정보 수정
        </div>

        <form className="myp-profile-form" onSubmit={handleSave}>
          <div className="myp-form-row">
            <div className="myp-form-group">
              <label className="myp-form-label">이름</label>
              <input
                className="myp-form-input"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
              />
            </div>
            <div className="myp-form-group">
              <label className="myp-form-label">아이디</label>
              <input
                className="myp-form-input"
                value={form.loginId}
                disabled
              />
            </div>
          </div>

          <div className="myp-form-group">
            <label className="myp-form-label">이메일</label>
            <input
              className="myp-form-input"
              type="email"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
            />
          </div>

          <div className="myp-form-group">
            <label className="myp-form-label">휴대폰 번호</label>
            <input
              className="myp-form-input"
              value={form.phone}
              onChange={e => handleChange('phone', e.target.value)}
            />
          </div>

          <div className="myp-section-divider" />

          <div className="myp-form-row">
            <div className="myp-form-group">
              <label className="myp-form-label">새 비밀번호</label>
              <input
                className="myp-form-input"
                type="password"
                placeholder="새 비밀번호 입력"
                value={form.newPw}
                onChange={e => handleChange('newPw', e.target.value)}
              />
            </div>
            <div className="myp-form-group">
              <label className="myp-form-label">비밀번호 확인</label>
              <input
                className="myp-form-input"
                type="password"
                placeholder="비밀번호 재입력"
                value={form.confirmPw}
                onChange={e => handleChange('confirmPw', e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="myp-save-btn">
            {saved ? '✓ 저장됨' : '저장하기'}
          </button>
        </form>
      </div>

      <div className="myp-section myp-danger-zone">
        <div className="myp-section-title myp-danger-title">
          <i className="ri-error-warning-line" />
          계정 관리
        </div>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
          회원 탈퇴 시 모든 주문 내역과 포인트, 쿠폰이 삭제되며 복구가 불가능합니다.
        </p>
        <button className="myp-delete-btn">회원 탈퇴</button>
      </div>
    </>
  )
}
