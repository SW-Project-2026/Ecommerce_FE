const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

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

export async function signup({ name, loginId, password, passwordConfirm, email, phone }) {
  const res = await fetch(`${BASE}/api/users/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, loginId, password, passwordConfirm, email, phone }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || '회원가입에 실패했어요.')
  return json.data
}
