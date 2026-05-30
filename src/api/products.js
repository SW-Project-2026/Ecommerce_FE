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

export async function searchProducts({ query, display = 10, start = 1, sort = 'sim' }) {
  const params = new URLSearchParams({ query, display, start, sort })
  const res = await fetch(`${BASE}/api/products/search?${params}`)
  if (!res.ok) throw new Error('상품 검색 실패')
  const json = await res.json()
  return json.data
}

export async function getProducts({ page = 0, size = 20, category, sort = 'createdAt,desc' } = {}) {
  const params = new URLSearchParams({ page, size, sort })
  if (category) params.append('productCategory', category)
  const res = await fetch(`${BASE}/api/products?${params}`)
  if (!res.ok) throw new Error('상품 목록 조회 실패')
  const json = await res.json()
  return json.data
}

export async function getProduct(productId) {
  const res = await fetch(`${BASE}/api/products/${productId}`)
  if (!res.ok) throw new Error('상품 조회 실패')
  const json = await res.json()
  return json.data
}

// ── 상품 수동 수집 ──
export async function syncProducts() {
  const res = await fetch(`${BASE}/api/products/sync`, {
    method: 'POST',
    headers: authHeaders(),
  })
  check401(res)
  if (!res.ok) throw new Error('상품 수동 수집 실패')
  const json = await res.json()
  return json.data
}

// ── 자동 수집 스케줄 조회 ──
export async function getSchedule() {
  const res = await fetch(`${BASE}/api/products/sync/schedule`, {
    method: 'GET',
    headers: authHeaders(),
  })
  check401(res)
  if (res.status === 404) return null  // 등록된 스케줄 없음
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || '스케줄 조회 실패')
  return json.data
}

// ── 자동 수집 스케줄 등록 ──
// cycle: DAILY | WEEKLY | MONTHLY
// time: HH:mm
export async function setSchedule({ cycle, time }) {
  const res = await fetch(`${BASE}/api/products/sync/schedule`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ cycle, time }),
  })
  const json = await res.json()
  check401(res)
  if (!res.ok) throw new Error(json.message || '스케줄 등록 실패')
  return json.data
}

// ── 자동 수집 스케줄 취소 ──
export async function cancelSchedule() {
  const res = await fetch(`${BASE}/api/products/sync/schedule`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  const json = await res.json()
  check401(res)
  if (!res.ok) throw new Error(json.message || '스케줄 취소 실패')
  return json.data
}