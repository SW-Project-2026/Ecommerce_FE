import axiosInstance from './axiosInstance'

// ── 광고 생성 ──
export async function adCreate({ adName, targetType, productId, category, keyword }) {
  const res = await axiosInstance.post('/api/ads', {
    adName,
    targetType,
    productId:  productId  || null,
    category:   category   || null,
    keyword:    keyword    || null,
  })
  return res.data.data
}

// ── 광고 목록 조회 ──
export async function adList({ page = 0, size = 100 } = {}) {
  const res = await axiosInstance.get('/api/ads', { params: { page, size } })
  return res.data.data.content
}

// ── 광고 단건 조회 ──
export async function adDetail({ adId }) {
  const res = await axiosInstance.get(`/api/ads/${adId}`)
  return res.data.data
}

// ── 광고 수정 ──
export async function adUpdate({ adId, adName, targetType, productId, category, keyword }) {
  const res = await axiosInstance.put(`/api/ads/${adId}`, {
    adName,
    targetType,
    productId:  productId  || null,
    category:   category   || null,
    keyword:    keyword    || null,
  })
  return res.data.data
}

// ── 광고 삭제 ──
export async function adDelete({ adId }) {
  await axiosInstance.delete(`/api/ads/${adId}`)
}

// ── 광고 사용자 노출 ──
export async function adExpose({ adId }) {
  const res = await axiosInstance.post(`/api/ads/${adId}/expose`)
  return res.data.data
}

// ── 광고 사용자 클릭 ──
export async function adClick({ adId }) {
  const res = await axiosInstance.patch(`/api/ads/${adId}/click`)
  return res.data.data
}

// ── 사용자 광고 조회 ──
export async function userAdList({ userId }) {
  const res = await axiosInstance.get(`/api/users/${userId}/ads`)
  return res.data.data
}