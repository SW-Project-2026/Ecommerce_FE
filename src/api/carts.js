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

// ── 내 장바구니 조회 ──
export async function cartGet() {
  const res = await fetch(`${BASE}/api/cart`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const json = await res.json()
  check401(res)
  if (!res.ok) throw new Error(json.message || '장바구니 조회 실패')
  return json.data  // [{ cartId, productId, productName, imageUrl, unitPrice, quantity, subtotal }]
}

// ── 장바구니 상품 추가 ──
export async function cartAdd({ productId, quantity }) {
  const res = await fetch(`${BASE}/api/cart`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ productId, quantity }),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 상품')
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '장바구니 추가 실패')
  return json.data  // { cartId, productId, productName, imageUrl, unitPrice, quantity, subtotal }
}

// ── 장바구니 수량 변경 ──
export async function cartUpdateQuantity({ cartId, quantity }) {
  const res = await fetch(`${BASE}/api/cart/${cartId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ quantity }),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 장바구니 항목')
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '수량 변경 실패')
  return json.data  // { cartId, productId, productName, imageUrl, unitPrice, quantity, subtotal }
}

// ── 장바구니 상품 삭제 ──
export async function cartDelete({ cartId }) {
  const res = await fetch(`${BASE}/api/cart/${cartId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 장바구니 항목')
  if (!res.ok) {
    try {
      const json = await res.json()
      throw new Error(json.message || '장바구니 삭제 실패')
    } catch {
      throw new Error('장바구니 삭제 실패')
    }
  }
}

// ── 장바구니 전체 비우기 ──
export async function cartClear() {
  const res = await fetch(`${BASE}/api/cart`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  check401(res)
  if (!res.ok) {
    try {
      const json = await res.json()
      throw new Error(json.message || '장바구니 비우기 실패')
    } catch {
      throw new Error('장바구니 비우기 실패')
    }
  }
}