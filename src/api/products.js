import axiosInstance from './axiosInstance'

// ── 상품 검색 (인증 불필요) ──
export async function searchProducts({ query, display = 10, start = 1, sort = 'sim' }) {
  const res = await axiosInstance.get('/api/products/search', {
    params: { query, display, start, sort },
  })
  return res.data.data
}

// ── 상품 목록 조회 (인증 불필요) ──
export async function getProducts({ page = 0, size = 20, category, sort = 'createdAt,desc' } = {}) {
  const params = { page, size, sort }
  if (category) params.productCategory = category
  const res = await axiosInstance.get('/api/products', { params })
  return res.data.data
}

// ── 상품 단건 조회 (인증 불필요) ──
export async function getProduct(productId) {
  const res = await axiosInstance.get(`/api/products/${productId}`)
  return res.data.data
}

// ── 상품 수동 수집 ──
export async function syncProducts() {
  const res = await axiosInstance.post('/api/products/sync')
  return res.data.data
}

// ── 자동 수집 스케줄 조회 ──
export async function getSchedule() {
  try {
    const res = await axiosInstance.get('/api/products/sync/schedule')
    return res.data.data
  } catch (err) {
    if (err.response?.status === 404) return null  // 등록된 스케줄 없음
    throw err
  }
}

// ── 자동 수집 스케줄 등록 ──
// cycle: DAILY | WEEKLY | MONTHLY
// time: HH:mm
export async function setSchedule({ cycle, time }) {
  const res = await axiosInstance.post('/api/products/sync/schedule', { cycle, time })
  return res.data.data
}

// ── 자동 수집 스케줄 취소 ──
export async function cancelSchedule() {
  const res = await axiosInstance.delete('/api/products/sync/schedule')
  return res.data.data
}