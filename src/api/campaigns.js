const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// ── JWT 토큰을 localStorage에서 가져오는 헬퍼 ──
function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// ── 캠페인 목록 조회 ──
// status, campaignGoalType, customerSegment, collectionType 은 모두 선택사항
// null/undefined/빈문자열이면 파라미터 자체를 보내지 않음 (BE enum 파싱 에러 방지)
export async function campaignList({ status, campaignGoalType, customerSegment, collectionType } = {}) {
  const params = new URLSearchParams()
  if (status)           params.append('status', status)
  if (campaignGoalType) params.append('campaignGoalType', campaignGoalType)
  if (customerSegment)  params.append('customerSegment', customerSegment)
  if (collectionType)   params.append('collectionType', collectionType)

  const query = params.toString() ? `?${params}` : ''
  const res = await fetch(`${BASE}/api/campaigns${query}`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const json = await res.json()
  if (res.status === 404) throw new Error('존재하지 않는 캠페인')
  if (!res.ok) throw new Error(json.message || '캠페인 목록 조회 실패')
  return json.data
}

// ── 캠페인 단건 조회 ──
export async function campaignDetail({ campaignId }) {
  const res = await fetch(`${BASE}/api/campaigns/${campaignId}`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const json = await res.json()
  if (res.status === 404) throw new Error('존재하지 않는 캠페인')
  if (!res.ok) throw new Error(json.message || '캠페인 조회 실패')
  return json.data
}

// ── 캠페인 생성 ──
// filters 배열 각 항목: { eventKey, eventFieldName, operator, value, periodDays }
// filterLogicalOperator: "AND" | "OR" (최상위 필드, 모든 필터에 공통 적용)
export async function campaignCreate({
  campaignName,
  description,
  campaignGoalType,
  customerSegment,    // 오타 수정: customerSegement → customerSegment
  startedAt,
  endedAt,
  collectionType,
  batchCycle,
  isDuplicate,
  filterLogicalOperator,
  filters,
}) {
  const res = await fetch(`${BASE}/api/campaigns`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      campaignName,
      description,
      campaignGoalType,
      customerSegment,
      startedAt,
      endedAt,
      collectionType,
      batchCycle,
      isDuplicate,
      filterLogicalOperator,
      filters,
    }),
  })
  const json = await res.json()
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '캠페인 생성 실패')
  return json.data
}

// ── 캠페인 수정 ──
export async function campaignUpdate({
  campaignId,
  campaignName,
  description,
  campaignGoalType,
  customerSegment,
  startedAt,
  endedAt,
  collectionType,
  batchCycle,
  isDuplicate,
  filterLogicalOperator,
  filters,
}) {
  const res = await fetch(`${BASE}/api/campaigns/${campaignId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({
      campaignName,
      description,
      campaignGoalType,
      customerSegment,
      startedAt,
      endedAt,
      collectionType,
      batchCycle,
      isDuplicate,
      filterLogicalOperator,
      filters,
    }),
  })
  const json = await res.json()
  if (res.status === 404) throw new Error('존재하지 않는 캠페인')
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '캠페인 수정 실패')
  return json.data
}

// ── 캠페인 상태 변경 ──
// status: "PENDING" | "IN_PROGRESS" | "PAUSED" | "ENDED"
export async function campaignStatusUpdate({ campaignId, status }) {
  const res = await fetch(
    `${BASE}/api/campaigns/${campaignId}/status?status=${status}`,
    {
      method: 'PATCH',
      headers: authHeaders(),
    }
  )
  const json = await res.json()
  if (res.status === 404) throw new Error('존재하지 않는 캠페인')
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '캠페인 상태 변경 실패')
  return json.data
}

// ── 캠페인 삭제 ──
// BE가 204 No Content를 반환하므로 json() 파싱 없음
export async function campaignDelete({ campaignId }) {
  const res = await fetch(`${BASE}/api/campaigns/${campaignId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (res.status === 404) throw new Error('존재하지 않는 캠페인')
  if (!res.ok) {
    // 204가 아닌 에러의 경우에만 json 파싱 시도
    try {
      const json = await res.json()
      throw new Error(json.message || '캠페인 삭제 실패')
    } catch {
      throw new Error('캠페인 삭제 실패')
    }
  }
  // 204 No Content - 반환값 없음
}