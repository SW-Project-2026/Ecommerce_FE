import { UnauthorizedError } from '../utils/withAutoRefresh'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function check401(res) {
  if (res.status === 401) throw new UnauthorizedError()
}

// ── 내 배송지 목록 조회 ──
export async function addressList() {
  const res = await fetch(`${BASE}/api/addresses`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const json = await res.json()
  check401(res)
  if (!res.ok) throw new Error(json.message || '배송지 목록 조회 실패')
  return json.data  // [{ addressId, roadNameAddress, addressDetail, default }]
}

// ── 배송지 추가 ──
export async function addressCreate({ roadNameAddress, addressDetail, isDefault = false }) {
  const res = await fetch(`${BASE}/api/addresses`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      roadNameAddress,
      addressDetail,
      default: isDefault,
    }),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '배송지 추가 실패')
  return json.data  // { addressId, roadNameAddress, addressDetail, default }
}

// ── 배송지 수정 ──
export async function addressUpdate({ addressId, roadNameAddress, addressDetail }) {
  const res = await fetch(`${BASE}/api/addresses/${addressId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ roadNameAddress, addressDetail }),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 배송지')
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '배송지 수정 실패')
  return json.data  // { addressId, roadNameAddress, addressDetail, default }
}

// ── 배송지 삭제 ──
export async function addressDelete({ addressId }) {
  const res = await fetch(`${BASE}/api/addresses/${addressId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 배송지')
  if (!res.ok) {
    try {
      const json = await res.json()
      throw new Error(json.message || '배송지 삭제 실패')
    } catch {
      throw new Error('배송지 삭제 실패')
    }
  }
}

// ── 기본 배송지 설정 ──
export async function addressSetDefault({ addressId }) {
  const res = await fetch(`${BASE}/api/addresses/${addressId}/default`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 배송지')
  if (!res.ok) throw new Error(json.message || '기본 배송지 설정 실패')
  return json.data  // { addressId, roadNameAddress, addressDetail, default }
}