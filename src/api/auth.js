import axiosInstance from './axiosInstance'

// ── 로그인 (withCredentials: 쿠키에 refresh token 저장) ──
export async function login({ loginId, password }) {
  const res = await axiosInstance.post('/api/users/login', { loginId, password })
  return res.data.data
}

// ── 회원가입 ──
export async function signup({ name, loginId, password, passwordConfirm, email, phone, marketingAgreed }) {
  const res = await axiosInstance.post('/api/users/signup', {
    name, loginId, password, passwordConfirm, email, phone, marketingAgreed,
  })
  return res.data.data
}

// ── 액세스 토큰 재발급 ──
export async function refreshToken() {
  const res = await axiosInstance.post('/api/users/refresh')
  return res.data.data
}

// ── 비밀번호 변경 ──
export async function updatePassword({ currentPassword, newPassword, newPasswordConfirm }) {
  const res = await axiosInstance.patch('/api/users/me/password', {
    currentPassword, newPassword, newPasswordConfirm,
  })
  return res.data.data
}

// ── 회원 탈퇴 ──
export async function withdraw() {
  const res = await axiosInstance.delete('/api/users/me')
  return res.data.data
}