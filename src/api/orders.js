import axiosInstance from './axiosInstance'

// ── 내 주문 목록 조회 ──
export async function orderList({ cursor, period = 'all', size = 10 } = {}) {
  const params = { period, size }
  if (cursor) params.cursor = cursor
  const res = await axiosInstance.get('/api/orders', { params })
  return res.data.data  // { content, nextCursor, hasNext }
}

// ── 주문 생성 ──
export async function orderCreate({ addressId, userCouponId, items }) {
  const res = await axiosInstance.post('/api/orders', {
    addressId,
    userCouponId: userCouponId ?? null,
    items,
  })
  return res.data.data
}

// ── 주문 상세 조회 ──
export async function orderDetail({ orderId }) {
  const res = await axiosInstance.get(`/api/orders/${orderId}`)
  return res.data.data
}

// ── 주문 취소 (PENDING 상태만 가능) ──
export async function orderCancel({ orderId }) {
  const res = await axiosInstance.patch(`/api/orders/${orderId}/cancel`)
  return res.data.data
}