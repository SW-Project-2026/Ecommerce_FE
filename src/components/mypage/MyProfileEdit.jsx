import { useState, useEffect, useRef } from 'react'
import {
  addressList,
  addressCreate,
  addressUpdate,
  addressDelete,
  addressSetDefault,
} from '../../api/addresses'

const EMPTY_FORM = { road: '', detail: '' }

function MyAddressSection() {
  const [addresses, setAddresses] = useState([])
  const [loading,   setLoading]   = useState(false)
  const [showForm,  setShowForm]  = useState(false)
  const [editId,    setEditId]    = useState(null)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [error,     setError]     = useState(null)

  useEffect(() => { fetchAddresses() }, [])

  async function fetchAddresses() {
    setLoading(true)
    try {
      const data = await addressList()
      setAddresses(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleAddOpen() {
    setEditId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function handleEditOpen(addr) {
    setEditId(addr.addressId)
    setForm({ road: addr.roadNameAddress, detail: addr.addressDetail ?? '' })
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY_FORM)
  }

  async function handleSave() {
    if (!form.road.trim()) return
    try {
      if (editId !== null) {
        // 수정 → PUT /api/addresses/{addressId}
        await addressUpdate({ addressId: editId, roadNameAddress: form.road, addressDetail: form.detail })
      } else {
        // 추가 → POST /api/addresses
        await addressCreate({ roadNameAddress: form.road, addressDetail: form.detail, isDefault: addresses.length === 0 })
      }
      handleCancel()
      fetchAddresses()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(addressId) {
    try {
      // 삭제 → DELETE /api/addresses/{addressId}
      await addressDelete({ addressId })
      fetchAddresses()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleSetDefault(addressId) {
    try {
      // 기본 설정 → PATCH /api/addresses/{addressId}/default
      await addressSetDefault({ addressId })
      fetchAddresses()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="myp-section">
      <div className="myp-section-title">
        <i className="ri-map-pin-line" />
        배송지 관리
      </div>

      {loading && <p style={{ fontSize: 13, color: '#9EA6B4' }}>불러오는 중...</p>}
      {error   && <p style={{ fontSize: 13, color: '#EF4444' }}>{error}</p>}

      <div className="myp-addr-list">
        {addresses.map(addr => (
          <div key={addr.addressId} className={`myp-addr-card${addr.default ? ' myp-addr-card--default' : ''}`}>
            <div className="myp-addr-info">
              {addr.default && <span className="myp-addr-default-badge">기본 배송지</span>}
              <p className="myp-addr-road">{addr.roadNameAddress}</p>
              {addr.addressDetail && <p className="myp-addr-detail">{addr.addressDetail}</p>}
            </div>
            <div className="myp-addr-actions">
              {!addr.default && (
                <button className="myp-addr-btn myp-addr-btn--default" onClick={() => handleSetDefault(addr.addressId)}>
                  기본 설정
                </button>
              )}
              <button className="myp-addr-btn myp-addr-btn--edit" onClick={() => handleEditOpen(addr)}>수정</button>
              <button className="myp-addr-btn myp-addr-btn--del" onClick={() => handleDelete(addr.addressId)}>삭제</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="myp-addr-form">
          <p className="myp-addr-form-title">{editId !== null ? '배송지 수정' : '새 배송지 추가'}</p>
          <div className="myp-form-group">
            <label className="myp-form-label">도로명 주소</label>
            <input className="myp-form-input" placeholder="도로명 주소를 입력해주세요" value={form.road} onChange={e => setForm(p => ({ ...p, road: e.target.value }))} />
          </div>
          <div className="myp-form-group" style={{ marginBottom: 0 }}>
            <label className="myp-form-label">상세 주소</label>
            <input className="myp-form-input" placeholder="동, 호수 등 상세 주소" value={form.detail} onChange={e => setForm(p => ({ ...p, detail: e.target.value }))} />
          </div>
          <div className="myp-addr-form-btns">
            <button className="myp-addr-form-save" onClick={handleSave}>{editId !== null ? '수정 완료' : '추가하기'}</button>
            <button className="myp-addr-form-cancel" onClick={handleCancel}>취소</button>
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

export default function MyProfileEdit({ initialSection = null }) {
  const addrRef = useRef(null)

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
              <input className="myp-form-input" value={form.name} onChange={e => handleChange('name', e.target.value)} />
            </div>
            <div className="myp-form-group">
              <label className="myp-form-label">아이디</label>
              <input className="myp-form-input" value={form.loginId} disabled />
            </div>
          </div>

          <div className="myp-form-group">
            <label className="myp-form-label">이메일</label>
            <input className="myp-form-input" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} />
          </div>

          <div className="myp-form-group">
            <label className="myp-form-label">휴대폰 번호</label>
            <input className="myp-form-input" value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
          </div>

          <div className="myp-section-divider" />

          <div className="myp-form-row">
            <div className="myp-form-group">
              <label className="myp-form-label">새 비밀번호</label>
              <input className="myp-form-input" type="password" placeholder="새 비밀번호 입력" value={form.newPw} onChange={e => handleChange('newPw', e.target.value)} />
            </div>
            <div className="myp-form-group">
              <label className="myp-form-label">비밀번호 확인</label>
              <input className="myp-form-input" type="password" placeholder="비밀번호 재입력" value={form.confirmPw} onChange={e => handleChange('confirmPw', e.target.value)} />
            </div>
          </div>

          <button type="submit" className="myp-save-btn">{saved ? '✓ 저장됨' : '저장하기'}</button>
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