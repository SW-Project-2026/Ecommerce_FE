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

// ── 내 주문 목록 조회 ──
export async function orderList({ cursor, period = 'all', size = 10 } = {}) {
  const params = new URLSearchParams({ period, size })
  if (cursor) params.append('cursor', cursor)

  const res = await fetch(`${BASE}/api/orders?${params}`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const json = await res.json()
  check401(res)
  if (!res.ok) throw new Error(json.message || '주문 목록 조회 실패')
  return json.data  // { content, nextCursor, hasNext }
}

// ── 주문 생성 ──
export async function orderCreate({ addressId, userCouponId, items }) {
  const res = await fetch(`${BASE}/api/orders`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      addressId,
      userCouponId: userCouponId ?? null,
      items,  // [{ productId, quantity }]
    }),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '주문 생성 실패')
  return json.data
}

// ── 주문 상세 조회 ──
export async function orderDetail({ orderId }) {
  const res = await fetch(`${BASE}/api/orders/${orderId}`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 주문')
  if (!res.ok) throw new Error(json.message || '주문 상세 조회 실패')
  return json.data
}

// ── 주문 취소 (PENDING 상태만 가능) ──
export async function orderCancel({ orderId }) {
  const res = await fetch(`${BASE}/api/orders/${orderId}/cancel`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 주문')
  if (res.status === 400) throw new Error(json.message || '취소할 수 없는 주문 상태입니다')
  if (!res.ok) throw new Error(json.message || '주문 취소 실패')
  return json.data
}