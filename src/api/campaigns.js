import { UnauthorizedError } from '../utils/withAutoRefresh'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// ── JWT 토큰을 localStorage에서 가져오는 헬퍼 ──
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

// ── 캠페인 목록 조회 ──
export async function campaignList({ status, campaignGoalType, customerSegment, collectionType, page = 0, size = 100 } = {}) {
  const params = new URLSearchParams()
  if (status)           params.append('status', status)
  if (campaignGoalType) params.append('campaignGoalType', campaignGoalType)
  if (customerSegment)  params.append('customerSegment', customerSegment)
  if (collectionType)   params.append('collectionType', collectionType)
  params.append('page', page)
  params.append('size', size)

  const res = await fetch(`${BASE}/api/campaigns?${params}`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 캠페인')
  if (!res.ok) throw new Error(json.message || '캠페인 목록 조회 실패')
  return json.data.content
}

// ── 캠페인 단건 조회 ──
export async function campaignDetail({ campaignId }) {
  const res = await fetch(`${BASE}/api/campaigns/${campaignId}`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 캠페인')
  if (!res.ok) throw new Error(json.message || '캠페인 조회 실패')
  return json.data
}

// ── 캠페인 생성 ──
export async function campaignCreate({
  campaignName,
  description,
  campaignGoalType,
  customerSegment,
  startedAt,
  endedAt,
  collectionType,
  batchCycle,
  batchTime,
  batchDayOfWeek,
  batchDayOfMonth,
  filterLogicalOperator,
  couponId,
  adId,
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
      batchCycle:            batchCycle      || null,
      batchTime:             batchTime       || null,
      batchDayOfWeek:        batchDayOfWeek  || null,
      batchDayOfMonth:       batchDayOfMonth || null,
      filterLogicalOperator,
      couponId:              couponId        ?? null,
      adId:                  adId            ?? null,
      filters,
    }),
  })
  const json = await res.json()
  check401(res)
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
  batchTime,
  batchDayOfWeek,
  batchDayOfMonth,
  filterLogicalOperator,
  couponId,
  adId,
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
      batchCycle:            batchCycle      || null,
      batchTime:             batchTime       || null,
      batchDayOfWeek:        batchDayOfWeek  || null,
      batchDayOfMonth:       batchDayOfMonth || null,
      filterLogicalOperator,
      couponId:              couponId        ?? null,
      adId:                  adId            ?? null,
      filters,
    }),
  })
  const json = await res.json()
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 캠페인')
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '캠페인 수정 실패')
  return json.data
}

// ── 캠페인 상태 변경 ──
export async function campaignStatusUpdate({ campaignId, status }) {
  const res = await fetch(
    `${BASE}/api/campaigns/${campaignId}/status?status=${status}`,
    {
      method: 'PATCH',
      headers: authHeaders(),
    }
  )
  const json = await res.json()
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 캠페인')
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '캠페인 상태 변경 실패')
  return json.data
}

// ── 캠페인 삭제 ──
export async function campaignDelete({ campaignId }) {
  const res = await fetch(`${BASE}/api/campaigns/${campaignId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  check401(res)
  if (res.status === 404) throw new Error('존재하지 않는 캠페인')
  if (!res.ok) {
    try {
      const json = await res.json()
      throw new Error(json.message || '캠페인 삭제 실패')
    } catch {
      throw new Error('캠페인 삭제 실패')
    }
  }
}