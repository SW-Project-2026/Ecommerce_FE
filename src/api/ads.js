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

// ── 광고 생성 ──
export async function adCreate({ adName, targetType, productId, category, keyword }) {
  const res = await fetch(`${BASE}/api/ads`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      adName,
      targetType,
      productId:  productId  || null,
      category:   category   || null,
      keyword:    keyword    || null,
    }),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '광고 생성 실패')
  return json.data
}

// ── 광고 목록 조회 ──
export async function adList({ page = 0, size = 100 } = {}) {
  const params = new URLSearchParams()
  params.append('page', page)
  params.append('size', size)

  const res = await fetch(`${BASE}/api/ads?${params}`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const json = await res.json()
  check401(res)
  if (!res.ok) throw new Error(json.message || '광고 목록 조회 실패')
  return json.data.content
}

// ── 광고 단건 조회 ──
export async function adDetail({ adId }) {
  const res = await fetch(`${BASE}/api/ads/${adId}`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 광고')
  if (!res.ok) throw new Error(json.message || '광고 조회 실패')
  return json.data
}

// ── 광고 수정 ──
export async function adUpdate({ adId, adName, targetType, productId, category, keyword }) {
  const res = await fetch(`${BASE}/api/ads/${adId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({
      adName,
      targetType,
      productId:  productId  || null,
      category:   category   || null,
      keyword:    keyword    || null,
    }),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 광고')
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '광고 수정 실패')
  return json.data
}

// ── 광고 삭제 ──
export async function adDelete({ adId }) {
  const res = await fetch(`${BASE}/api/ads/${adId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 광고')
  if (!res.ok) {
    try {
      const json = await res.json()
      throw new Error(json.message || '광고 삭제 실패')
    } catch {
      throw new Error('광고 삭제 실패')
    }
  }
}

// ── 광고 사용자 노출 ──
export async function adExpose({ adId }) {
  const res = await fetch(`${BASE}/api/ads/${adId}/expose`, {
    method: 'POST',
    headers: authHeaders(),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '광고 노출 기록 실패')
  return json.data
}

// ── 광고 사용자 클릭 ──
export async function adClick({ adId }) {
  const res = await fetch(`${BASE}/api/ads/${adId}/click`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '광고 클릭 기록 실패')
  return json.data
}

// ── 사용자 광고 조회 ──
export async function userAdList({ userId }) {
  const res = await fetch(`${BASE}/api/users/${userId}/ads`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 유저')
  if (!res.ok) throw new Error(json.message || '사용자 광고 조회 실패')
  return json.data
}