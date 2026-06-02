import axiosInstance from './axiosInstance'

// ── 내 정보 조회 ──
export async function getMyProfile() {
  const res = await axiosInstance.get('/api/users/me')
  return res.data.data
}

// ── 내 정보 수정 ──
export async function updateProfile({ name, phone }) {
  const res = await axiosInstance.put('/api/users/me', { name, phone })
  return res.data.data
}

// ── 특정 회원 조회 (ADMIN) ──
export async function getUserDetail({ userId }) {
  const res = await axiosInstance.get(`/api/users/admin/${userId}`)
  return res.data.data
}

// ── 전체 회원 목록 조회 (ADMIN) ──
export async function getUserList({ page = 0, size = 20 } = {}) {
  const res = await axiosInstance.get('/api/users/admin/list', { params: { page, size } })
  return res.data.data
}