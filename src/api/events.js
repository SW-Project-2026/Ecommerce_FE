import { UnauthorizedError } from '../utils/withAutoRefresh'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function check401(res) {
  if (res.status === 401) throw new UnauthorizedError()
}

// ── 이벤트 목록 조회 (필드 포함) ──
// isActive: true 면 활성 이벤트만 조회
export async function eventList({ isActive } = {}) {
  const params = new URLSearchParams()
  if (isActive !== undefined) params.append('isActive', isActive)

  const query = params.toString() ? `?${params}` : ''
  const res = await fetch(`${BASE}/api/events${query}`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '이벤트 목록 조회 실패')
  return json.data
}

// ── 이벤트 필드 추가 ──
export async function addEventField(eventId, { fieldName, fieldType, isRequired, description }) {
  const res = await fetch(`${BASE}/api/events/${eventId}/fields`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ fieldName, fieldType, isRequired, description }),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '이벤트 필드 추가 실패')
  return json.data
}

// ── 이벤트 필드 수정 ──
export async function updateEventField(eventId, fieldId, { fieldName, fieldType, isRequired, description }) {
  const res = await fetch(`${BASE}/api/events/${eventId}/fields/${fieldId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ fieldId, fieldName, fieldType, isRequired, description }),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '이벤트 필드 수정 실패')
  return json.data
}

// ── 이벤트 필드 삭제 ──
export async function deleteEventField(eventId, fieldId) {
  const res = await fetch(`${BASE}/api/events/${eventId}/fields/${fieldId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  check401(res)
  if (!res.ok) {
    const json = await res.json()
    throw new Error(json.message || '이벤트 필드 삭제 실패')
  }
}