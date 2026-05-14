const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// ── 광고 생성 ──
// targetType: PRODUCT / CATEGORY / KEYWORD
// productId: targetType=PRODUCT일 때
// category: targetType=CATEGORY일 때 (BEAUTY/FASHION_ACCESSORY/LIVING_HEALTH/FURNITURE_INTERIOR/FOOD/SPORTS_LEISURE/DIGITAL_APPLIANCE/FASHION_CLOTHING)
// keyword: targetType=KEYWORD일 때
export async function adCreate({ adName, targetType, productId, category, keyword }) {
  const res = await fetch(`${BASE}/api/ads`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      adName,
      targetType,
      productId:  productId  || null,
      category:   category   || null,
      keyword:    keyword    || null,
    }),
  })
  const json = await res.json()
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '광고 생성 실패')
  return json.data
}

// ── 광고 목록 조회 ──
export async function adList() {
  const res = await fetch(`${BASE}/api/ads`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || '광고 목록 조회 실패')
  return json.data
}

// ── 광고 단건 조회 ──
export async function adDetail({ adId }) {
  const res = await fetch(`${BASE}/api/ads/${adId}`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const json = await res.json()
  if (res.status === 404) throw new Error('존재하지 않는 광고')
  if (!res.ok) throw new Error(json.message || '광고 조회 실패')
  return json.data
}

// ── 광고 수정 ──
export async function adUpdate({ adId, adName, targetType, productId, category, keyword }) {
  const res = await fetch(`${BASE}/api/ads/${adId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({
      adName,
      targetType,
      productId:  productId  || null,
      category:   category   || null,
      keyword:    keyword    || null,
    }),
  })
  const json = await res.json()
  if (res.status === 404) throw new Error('존재하지 않는 광고')
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '광고 수정 실패')
  return json.data
}

// ── 광고 삭제 ──
export async function adDelete({ adId }) {
  const res = await fetch(`${BASE}/api/ads/${adId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (res.status === 404) throw new Error('존재하지 않는 광고')
  if (!res.ok) {
    try {
      const json = await res.json()
      throw new Error(json.message || '광고 삭제 실패')
    } catch {
      throw new Error('광고 삭제 실패')
    }
  }
}

// ── 광고 사용자 노출 ──
// 유저가 광고를 봤을 때 호출 → AdExposure 레코드 생성 (clicked=false)
export async function adExpose({ adId }) {
  const res = await fetch(`${BASE}/api/ads/${adId}/expose`, {
    method: 'POST',
    headers: authHeaders(),
  })
  const json = await res.json()
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '광고 노출 기록 실패')
  return json.data
}

// ── 광고 사용자 클릭 ──
// 유저가 광고 클릭 시 호출 → clicked=true, clickedAt=now 업데이트
export async function adClick({ adId }) {
  const res = await fetch(`${BASE}/api/ads/${adId}/click`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
  const json = await res.json()
  if (res.status === 400) throw new Error(json.message || '잘못된 요청')
  if (!res.ok) throw new Error(json.message || '광고 클릭 기록 실패')
  return json.data
}

// ── 사용자 광고 조회 ──
// 특정 유저가 노출된 광고 목록 조회
export async function userAdList({ userId }) {
  const res = await fetch(`${BASE}/api/users/${userId}/ads`, {
    method: 'GET',
    headers: authHeaders(),
  })
  const json = await res.json()
  if (res.status === 404) throw new Error('존재하지 않는 유저')
  if (!res.ok) throw new Error(json.message || '사용자 광고 조회 실패')
  return json.data
}