import axios from 'axios'
import axiosInstance from './axiosInstance'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// ── 로그인 (401 시 로그아웃 방지를 위해 일반 axios 직접 호출) ──
export async function login({ loginId, password }) {
  try {
    const res = await axios.post(
      `${BASE}/api/users/login`,
      { loginId, password },
      { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
    )
    return res.data.data
  } catch (err) {
    const beMessage = err.response?.data?.message
    throw new Error(beMessage || err.message)
  }
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

// ── 비밀번호 변경 (401 시 로그아웃 방지를 위해 일반 axios 직접 호출) ──
export async function updatePassword({ currentPassword, newPassword, newPasswordConfirm }) {
  const token = localStorage.getItem('accessToken')
  try {
    const res = await axios.patch(
      `${BASE}/api/users/me/password`,
      { currentPassword, newPassword, newPasswordConfirm },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        withCredentials: true,
      }
    )
    return res.data.data
  } catch (err) {
    const beMessage = err.response?.data?.message
    throw new Error(beMessage || err.message)
  }
}

// ── 회원 탈퇴 ──
export async function withdraw({ password }) {
  const res = await axiosInstance.delete('/api/users/me', {
    data: { password },
  })
  return res.data.data
}