import axiosInstance from './axiosInstance'

// ── 내 장바구니 조회 ──
export async function cartGet() {
  const res = await axiosInstance.get('/api/cart')
  return res.data.data
}

// ── 장바구니 상품 추가 ──
export async function cartAdd({ productId, quantity }) {
  const res = await axiosInstance.post('/api/cart', { productId, quantity })
  return res.data.data
}

// ── 장바구니 수량 변경 ──
export async function cartUpdateQuantity({ cartId, quantity }) {
  const res = await axiosInstance.patch(`/api/cart/${cartId}`, { quantity })
  return res.data.data
}

// ── 장바구니 상품 삭제 ──
export async function cartDelete({ cartId }) {
  await axiosInstance.delete(`/api/cart/${cartId}`)
}

// ── 장바구니 전체 비우기 ──
export async function cartClear() {
  await axiosInstance.delete('/api/cart')
}