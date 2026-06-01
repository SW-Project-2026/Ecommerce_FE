import axiosInstance from './axiosInstance'

// ── 쿠폰 생성 ──
export async function couponCreate({
  name, code, discountType, discountAmount,
  minOrderAmount, maxDiscountAmount, expiredAt,
  issuanceMethod, issueLimit,
}) {
  const res = await axiosInstance.post('/api/coupons', {
    name, code, discountType, discountAmount,
    minOrderAmount, maxDiscountAmount, expiredAt,
    issuanceMethod, issueLimit,
  })
  return res.data.data
}

// ── 쿠폰 목록 조회 ──
export async function couponList({ page = 0, size = 100 } = {}) {
  const res = await axiosInstance.get('/api/coupons', { params: { page, size } })
  return res.data.data.content
}

// ── 쿠폰 단건 조회 ──
export async function couponDetail({ couponId }) {
  const res = await axiosInstance.get(`/api/coupons/${couponId}`)
  return res.data.data
}

// ── 쿠폰 수정 ──
export async function couponUpdate({
  couponId, name, code, discountType, discountAmount,
  minOrderAmount, maxDiscountAmount, expiredAt,
  issuanceMethod, issueLimit,
}) {
  const res = await axiosInstance.put(`/api/coupons/${couponId}`, {
    name, code, discountType, discountAmount,
    minOrderAmount, maxDiscountAmount, expiredAt,
    issuanceMethod, issueLimit,
  })
  return res.data.data
}

// ── 쿠폰 삭제 ──
export async function couponDelete({ couponId }) {
  await axiosInstance.delete(`/api/coupons/${couponId}`)
}

// ── 특정 회원에게 쿠폰 발급 ──
export async function couponIssue({ couponId, userId }) {
  const res = await axiosInstance.post(`/api/coupons/${couponId}/issue/${userId}`)
  return res.data.data
}

// ── 쿠폰 사용 처리 ──
export async function couponUse({ userId, userCouponId }) {
  const res = await axiosInstance.patch(`/api/users/${userId}/coupons/${userCouponId}/use`)
  return res.data.data
}

// ── 회원 쿠폰 목록 조회 ──
export async function userCouponList({ userId }) {
  const res = await axiosInstance.get(`/api/users/${userId}/coupons`)
  return res.data.data
}

// ── SMS 링크 쿠폰 수령 (인증 불필요) ──
export async function couponClaim({ token }) {
  const res = await axiosInstance.get('/api/coupons/claim', { params: { token } })
  return res.data.data
}