import { useState, useEffect, useRef } from 'react'

// ── 하드코딩 배송지 데이터 (TODO: API 연동 시 교체) ──────────────────────
const INIT_ADDRESSES = [
  {
    id: 1,
    isDefault: true,
    road: '서울특별시 강남구 테헤란로 123',
    detail: '역삼동 456호',
  },
  {
    id: 2,
    isDefault: false,
    road: '경기도 성남시 분당구 판교역로 235',
    detail: '알파돔시티 102동 1201호',
  },
]

const EMPTY_FORM = { road: '', detail: '' }

// ── 배송지 관리 섹션 ────────────────────────────────────────────────────────
function MyAddressSection() {
  const [addresses, setAddresses] = useState(INIT_ADDRESSES)
  const [showForm, setShowForm] = useState(false)   // 추가 폼 표시 여부
  const [editId, setEditId] = useState(null)         // 수정 중인 주소 id
  const [form, setForm] = useState(EMPTY_FORM)

  function handleAddOpen() {
    setEditId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function handleEditOpen(addr) {
    setEditId(addr.id)
    setForm({ road: addr.road, detail: addr.detail })
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY_FORM)
  }

  function handleSave() {
    if (!form.road.trim()) return
    if (editId !== null) {
      // 수정
      setAddresses(prev =>
        prev.map(a => a.id === editId ? { ...a, road: form.road, detail: form.detail } : a)
      )
    } else {
      // 추가 — 첫 주소면 기본 배송지로
      const newAddr = {
        id: Date.now(),
        isDefault: addresses.length === 0,
        road: form.road,
        detail: form.detail,
      }
      setAddresses(prev => [...prev, newAddr])
    }
    handleCancel()
    // TODO: API 연동 시 POST/PUT /api/addresses 호출
  }

  function handleDelete(id) {
    setAddresses(prev => {
      const next = prev.filter(a => a.id !== id)
      // 삭제된 게 기본 배송지였으면 첫 번째를 기본으로
      if (prev.find(a => a.id === id)?.isDefault && next.length > 0) {
        next[0] = { ...next[0], isDefault: true }
      }
      return next
    })
    // TODO: API 연동 시 DELETE /api/addresses/{id} 호출
  }

  function handleSetDefault(id) {
    setAddresses(prev =>
      prev.map(a => ({ ...a, isDefault: a.id === id }))
    )
    // TODO: API 연동 시 PATCH /api/addresses/{id}/default 호출
  }

  return (
    <div className="myp-section">
      <div className="myp-section-title">
        <i className="ri-map-pin-line" />
        배송지 관리
      </div>

      <div className="myp-addr-list">
        {addresses.map(addr => (
          <div key={addr.id} className={`myp-addr-card${addr.isDefault ? ' myp-addr-card--default' : ''}`}>
            <div className="myp-addr-info">
              {addr.isDefault && (
                <span className="myp-addr-default-badge">기본 배송지</span>
              )}
              <p className="myp-addr-road">{addr.road}</p>
              {addr.detail && <p className="myp-addr-detail">{addr.detail}</p>}
            </div>
            <div className="myp-addr-actions">
              {!addr.isDefault && (
                <button
                  className="myp-addr-btn myp-addr-btn--default"
                  onClick={() => handleSetDefault(addr.id)}
                >
                  기본 설정
                </button>
              )}
              <button
                className="myp-addr-btn myp-addr-btn--edit"
                onClick={() => handleEditOpen(addr)}
              >
                수정
              </button>
              <button
                className="myp-addr-btn myp-addr-btn--del"
                onClick={() => handleDelete(addr.id)}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 추가/수정 인라인 폼 */}
      {showForm && (
        <div className="myp-addr-form">
          <p className="myp-addr-form-title">
            {editId !== null ? '배송지 수정' : '새 배송지 추가'}
          </p>
          <div className="myp-form-group">
            <label className="myp-form-label">도로명 주소</label>
            <input
              className="myp-form-input"
              placeholder="도로명 주소를 입력해주세요"
              value={form.road}
              onChange={e => setForm(p => ({ ...p, road: e.target.value }))}
            />
          </div>
          <div className="myp-form-group" style={{ marginBottom: 0 }}>
            <label className="myp-form-label">상세 주소</label>
            <input
              className="myp-form-input"
              placeholder="동, 호수 등 상세 주소"
              value={form.detail}
              onChange={e => setForm(p => ({ ...p, detail: e.target.value }))}
            />
          </div>
          <div className="myp-addr-form-btns">
            <button className="myp-addr-form-save" onClick={handleSave}>
              {editId !== null ? '수정 완료' : '추가하기'}
            </button>
            <button className="myp-addr-form-cancel" onClick={handleCancel}>
              취소
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <button className="myp-addr-add-btn" onClick={handleAddOpen}>
          <i className="ri-add-line" />
          새 배송지 추가
        </button>
      )}
    </div>
  )
}

// ── 메인 컴포넌트 ────────────────────────────────────────────────────────────
export default function MyProfileEdit({ initialSection = null }) {
  const addrRef = useRef(null)

  // 배송지 섹션으로 자동 스크롤
  useEffect(() => {
    if (initialSection === 'address' && addrRef.current) {
      setTimeout(() => {
        addrRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [initialSection])
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
    // TODO: API 연동 시 PUT /api/users/me 호출
  }

  return (
    <>
      {/* ── 내 정보 수정 ── */}
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

      {/* ── 배송지 관리 ── */}
      <div ref={addrRef}>
        <MyAddressSection />
      </div>

      {/* ── 계정 관리 ── */}
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