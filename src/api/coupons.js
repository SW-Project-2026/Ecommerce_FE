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

// ── 쿠폰 생성 ──
export async function couponCreate({
  name, code, discountType, discountAmount,
  minOrderAmount, maxDiscountAmount, expiredAt,
  issuanceMethod, issueLimit,
}) {
  const res = await fetch(`${BASE}/api/coupons`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      name, code, discountType, discountAmount,
      minOrderAmount, maxDiscountAmount, expiredAt,
      issuanceMethod, issueLimit,
    }),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '쿠폰 생성 실패')
  return json.data
}

// ── 쿠폰 목록 조회 ──
export async function couponList({ page = 0, size = 100 } = {}) {
  const params = new URLSearchParams()
  params.append('page', page)
  params.append('size', size)

  const res = await fetch(`${BASE}/api/coupons?${params}`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const json = await res.json()
  check401(res)
  if (!res.ok) throw new Error(json.message || '쿠폰 목록 조회 실패')
  return json.data.content
}

// ── 쿠폰 단건 조회 ──
export async function couponDetail({ couponId }) {
  const res = await fetch(`${BASE}/api/coupons/${couponId}`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 쿠폰')
  if (!res.ok) throw new Error(json.message || '쿠폰 조회 실패')
  return json.data
}

// ── 쿠폰 수정 ──
export async function couponUpdate({
  couponId, name, code, discountType, discountAmount,
  minOrderAmount, maxDiscountAmount, expiredAt,
  issuanceMethod, issueLimit,
}) {
  const res = await fetch(`${BASE}/api/coupons/${couponId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({
      name, code, discountType, discountAmount,
      minOrderAmount, maxDiscountAmount, expiredAt,
      issuanceMethod, issueLimit,
    }),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 쿠폰')
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '쿠폰 수정 실패')
  return json.data
}

// ── 쿠폰 삭제 ──
export async function couponDelete({ couponId }) {
  const res = await fetch(`${BASE}/api/coupons/${couponId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 쿠폰')
  if (!res.ok) {
    try {
      const json = await res.json()
      throw new Error(json.message || '쿠폰 삭제 실패')
    } catch {
      throw new Error('쿠폰 삭제 실패')
    }
  }
}

// ── 특정 회원에게 쿠폰 발급 ──
export async function couponIssue({ couponId, userId }) {
  const res = await fetch(`${BASE}/api/coupons/${couponId}/issue/${userId}`, {
    method: 'POST',
    headers: authHeaders(),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 쿠폰 또는 유저')
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '쿠폰 발급 실패')
  return json.data
}

// ── 쿠폰 사용 처리 ──
export async function couponUse({ userId, userCouponId }) {
  const res = await fetch(`${BASE}/api/users/${userId}/coupons/${userCouponId}/use`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 쿠폰')
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '쿠폰 사용 처리 실패')
  return json.data
}

// ── 회원 쿠폰 목록 조회 ──
export async function userCouponList({ userId }) {
  const res = await fetch(`${BASE}/api/users/${userId}/coupons`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 유저')
  if (!res.ok) throw new Error(json.message || '회원 쿠폰 목록 조회 실패')
  return json.data
}