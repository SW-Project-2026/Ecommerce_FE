const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// ── 내 정보 조회 ──
export async function getMyProfile() {
  const res = await fetch(`${BASE}/api/users/me`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || '내 정보 조회 실패')
  return json.data
}

// ── 내 정보 수정 ──
export async function updateProfile({ name, phone }) {
  const res = await fetch(`${BASE}/api/users/me`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ name, phone }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || '내 정보 수정 실패')
  return json.data
}

// ── 특정 회원 조회 (ADMIN) ──
export async function getUserDetail({ userId }) {
  const res = await fetch(`${BASE}/api/users/admin/${userId}`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const json = await res.json()
  if (res.status === 404) throw new Error('존재하지 않는 유저')
  if (!res.ok) throw new Error(json.message || '회원 조회 실패')
  return json.data
}

// ── 전체 회원 목록 조회 (ADMIN) ──
export async function getUserList({ page = 0, size = 20 } = {}) {
  const params = new URLSearchParams({ page, size })
  const res = await fetch(`${BASE}/api/users/admin/list?${params}`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || '회원 목록 조회 실패')
  return json.data
}