import axiosInstance from './axiosInstance'

// ── 홈 화면 (비로그인) ──
export async function getHome() {
  const res = await axiosInstance.get('/api/home')
  return res.data.data
}

// ── 홈 화면 (로그인) ──
export async function getHomeByUser({ userId }) {
  const res = await axiosInstance.get(`/api/home/${userId}`)
  return res.data.data
}