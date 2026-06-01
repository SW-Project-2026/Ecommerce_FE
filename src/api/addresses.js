import axiosInstance from './axiosInstance'

// ── 내 배송지 목록 조회 ──
export async function addressList() {
  const res = await axiosInstance.get('/api/addresses')
  return res.data.data
}

// ── 배송지 추가 ──
export async function addressCreate({ roadNameAddress, addressDetail, isDefault = false }) {
  const res = await axiosInstance.post('/api/addresses', {
    roadNameAddress,
    addressDetail,
    default: isDefault,
  })
  return res.data.data
}

// ── 배송지 수정 ──
export async function addressUpdate({ addressId, roadNameAddress, addressDetail }) {
  const res = await axiosInstance.put(`/api/addresses/${addressId}`, {
    roadNameAddress,
    addressDetail,
  })
  return res.data.data
}

// ── 배송지 삭제 ──
export async function addressDelete({ addressId }) {
  await axiosInstance.delete(`/api/addresses/${addressId}`)
}

// ── 기본 배송지 설정 ──
export async function addressSetDefault({ addressId }) {
  const res = await axiosInstance.patch(`/api/addresses/${addressId}/default`)
  return res.data.data
}