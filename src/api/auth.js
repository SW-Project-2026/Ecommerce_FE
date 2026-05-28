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

export async function login({ loginId, password }) {
  const res = await fetch(`${BASE}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ loginId, password }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || '로그인에 실패했어요.')
  return json.data
}

export async function signup({ name, loginId, password, passwordConfirm, email, phone, marketingAgreed }) {
  const res = await fetch(`${BASE}/api/users/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, loginId, password, passwordConfirm, email, phone, marketingAgreed }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || '회원가입에 실패했어요.')
  return json.data
}

// ── 액세스 토큰 재발급 ──
export async function refreshToken() {
  const res = await fetch(`${BASE}/api/users/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || '토큰 재발급 실패')
  return json.data
}

// ── 비밀번호 변경 ──
export async function updatePassword({ currentPassword, newPassword, newPasswordConfirm }) {
  const res = await fetch(`${BASE}/api/users/me/password`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword, newPassword, newPasswordConfirm }),
  })
  const json = await res.json()
  check401(res)
  if (!res.ok) throw new Error(json.message || '비밀번호 변경 실패')
  return json.data
}

// ── 회원 탈퇴 ──
export async function withdraw() {
  const res = await fetch(`${BASE}/api/users/me`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  const json = await res.json()
  check401(res)
  if (!res.ok) throw new Error(json.message || '회원 탈퇴 실패')
  return json.data
}