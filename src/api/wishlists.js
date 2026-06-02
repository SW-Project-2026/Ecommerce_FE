import axiosInstance from './axiosInstance'

// ── 찜 추가 ──
export async function wishlistAdd({ productId }) {
  const res = await axiosInstance.post(`/api/wishlist/${productId}`)
  return res.data.data
}

// ── 내 찜 목록 조회 ──
export async function wishlistGet({ cursor, size = 10 } = {}) {
  const params = { size }
  if (cursor) params.cursor = cursor
  const res = await axiosInstance.get('/api/wishlist', { params })
  return res.data.data
}

// ── 찜 삭제 ──
export async function wishlistDelete({ wishId }) {
  await axiosInstance.delete(`/api/wishlist/${wishId}`)
}