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

// ── 찜 추가 ──
export async function wishlistAdd({ productId }) {
  const res = await fetch(`${BASE}/api/wishlist/${productId}`, {
    method: 'POST',
    headers: authHeaders(),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 상품')
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '찜 추가 실패')
  return json.data  // { wishId, productId, productName, imageUrl, minPrice, maxPrice }
}

// ── 내 찜 목록 조회 ──
export async function wishlistGet({ cursor, size = 10 } = {}) {
  const params = new URLSearchParams({ size })
  if (cursor) params.append('cursor', cursor)

  const res = await fetch(`${BASE}/api/wishlist?${params}`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const json = await res.json()
  check401(res)
  if (!res.ok) throw new Error(json.message || '찜 목록 조회 실패')
  return json.data  // { content, nextCursor, hasNext }
}

// ── 찜 삭제 ──
export async function wishlistDelete({ wishId }) {
  const res = await fetch(`${BASE}/api/wishlist/${wishId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 찜')
  if (!res.ok) {
    try {
      const json = await res.json()
      throw new Error(json.message || '찜 삭제 실패')
    } catch {
      throw new Error('찜 삭제 실패')
    }
  }
}