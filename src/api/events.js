import axiosInstance from './axiosInstance'

// ── 이벤트 목록 조회 (필드 포함) ──
export async function eventList({ isActive } = {}) {
  const params = {}
  if (isActive !== undefined) params.isActive = isActive
  const res = await axiosInstance.get('/api/events', { params })
  return res.data.data
}

// ── 이벤트 필드 추가 ──
export async function addEventField(eventId, { fieldName, fieldType, isRequired, description }) {
  const res = await axiosInstance.post(`/api/events/${eventId}/fields`, {
    fieldName, fieldType, isRequired, description,
  })
  return res.data.data
}

// ── 이벤트 필드 수정 ──
export async function updateEventField(eventId, fieldId, { fieldName, fieldType, isRequired, description }) {
  const res = await axiosInstance.patch(`/api/events/${eventId}/fields/${fieldId}`, {
    fieldId, fieldName, fieldType, isRequired, description,
  })
  return res.data.data
}

// ── 이벤트 필드 삭제 ──
export async function deleteEventField(eventId, fieldId) {
  await axiosInstance.delete(`/api/events/${eventId}/fields/${fieldId}`)
}