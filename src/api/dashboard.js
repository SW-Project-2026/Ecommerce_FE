import axiosInstance from './axiosInstance'

// ── 전체 요약 지표 (총 고객수 / CTR / 쿠폰 사용률) ──
export async function getDashboardSummary() {
  const res = await axiosInstance.get('/api/dashboard/summary')
  return res.data.data
}

// ── 월별 신규 가입·탈퇴율 (최근 12개월) ──
export async function getMonthlyStats() {
  const res = await axiosInstance.get('/api/dashboard/monthly-stats')
  return res.data.data
}

// ── 고객 목록 (페이지네이션 + 검색 + 필터) ──
export async function getCustomerList({ page = 0, size = 10, search, filter } = {}) {
  const params = { page, size }
  if (search) params.search = search
  if (filter) params.filter = filter
  const res = await axiosInstance.get('/api/dashboard/customers', { params })
  return res.data.data  // { customers, pagination }
}

// ── 고객 개인 대시보드 (관리자 전용) ──
export async function getCustomerDetail({ userId }) {
  const res = await axiosInstance.get(`/api/dashboard/customers/${userId}`)
  return res.data.data
}

// ── 고객 구매이력 (관리자 전용, 무한스크롤) ──
export async function getCustomerOrders({ userId, cursor, size = 4 } = {}) {
  const params = { size }
  if (cursor) params.cursor = cursor
  const res = await axiosInstance.get(`/api/dashboard/customers/${userId}/orders`, { params })
  return res.data.data  // { content, nextCursor, hasNext }
}

// ── 고객 장바구니 (관리자 전용, 무한스크롤) ──
export async function getCustomerCart({ userId, cursor, size = 4 } = {}) {
  const params = { size }
  if (cursor) params.cursor = cursor
  const res = await axiosInstance.get(`/api/dashboard/customers/${userId}/cart`, { params })
  return res.data.data  // { content, nextCursor, hasNext }
}