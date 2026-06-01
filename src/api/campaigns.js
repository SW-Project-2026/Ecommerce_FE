import axiosInstance from './axiosInstance'

// ── 캠페인 목록 조회 ──
export async function campaignList({ status, campaignGoalType, customerSegment, collectionType, page = 0, size = 100 } = {}) {
  const params = {}
  if (status)           params.status = status
  if (campaignGoalType) params.campaignGoalType = campaignGoalType
  if (customerSegment)  params.customerSegment = customerSegment
  if (collectionType)   params.collectionType = collectionType
  params.page = page
  params.size = size

  const res = await axiosInstance.get('/api/campaigns', { params })
  return res.data.data.content
}

// ── 캠페인 단건 조회 ──
export async function campaignDetail({ campaignId }) {
  const res = await axiosInstance.get(`/api/campaigns/${campaignId}`)
  return res.data.data
}

// ── 캠페인 생성 ──
export async function campaignCreate({
  campaignName, description, campaignGoalType, customerSegment,
  startedAt, endedAt, collectionType,
  batchCycle, batchTime, batchDayOfWeek, batchDayOfMonth,
  filterLogicalOperator, couponRestrictionDays,
  issueType, couponId, adId, messageType, messageSubject, messageContent,
  duplicatePolicy, filters,
}) {
  const res = await axiosInstance.post('/api/campaigns', {
    campaignName, description, campaignGoalType, customerSegment,
    startedAt, endedAt, collectionType,
    batchCycle:            batchCycle            || null,
    batchTime:             batchTime             || null,
    batchDayOfWeek:        batchDayOfWeek        || null,
    batchDayOfMonth:       batchDayOfMonth       || null,
    filterLogicalOperator,
    couponRestrictionDays: couponRestrictionDays ?? null,
    issueType:             issueType             ?? null,
    couponId:              couponId              ?? null,
    adId:                  adId                  ?? null,
    messageType:           messageType           ?? null,
    messageSubject:        messageSubject        ?? null,
    messageContent:        messageContent        ?? null,
    duplicatePolicy:       duplicatePolicy       ?? null,
    filters,
  })
  return res.data.data
}

// ── 캠페인 수정 ──
export async function campaignUpdate({
  campaignId, campaignName, description, campaignGoalType, customerSegment,
  startedAt, endedAt, collectionType,
  batchCycle, batchTime, batchDayOfWeek, batchDayOfMonth,
  filterLogicalOperator, couponRestrictionDays,
  issueType, couponId, adId, messageType, messageSubject, messageContent,
  duplicatePolicy, filters,
}) {
  const res = await axiosInstance.put(`/api/campaigns/${campaignId}`, {
    campaignName, description, campaignGoalType, customerSegment,
    startedAt, endedAt, collectionType,
    batchCycle:            batchCycle            || null,
    batchTime:             batchTime             || null,
    batchDayOfWeek:        batchDayOfWeek        || null,
    batchDayOfMonth:       batchDayOfMonth       || null,
    filterLogicalOperator,
    couponRestrictionDays: couponRestrictionDays ?? null,
    issueType:             issueType             ?? null,
    couponId:              couponId              ?? null,
    adId:                  adId                  ?? null,
    messageType:           messageType           ?? null,
    messageSubject:        messageSubject        ?? null,
    messageContent:        messageContent        ?? null,
    duplicatePolicy:       duplicatePolicy       ?? null,
    filters,
  })
  return res.data.data
}

// ── 캠페인 상태 변경 ──
export async function campaignStatusUpdate({ campaignId, status }) {
  const res = await axiosInstance.patch(`/api/campaigns/${campaignId}/status`, null, {
    params: { status },
  })
  return res.data.data
}

// ── 캠페인 삭제 ──
export async function campaignDelete({ campaignId }) {
  await axiosInstance.delete(`/api/campaigns/${campaignId}`)
}

// ── 캠페인 문자 발송 (SMS/LMS) ──
export async function sendCampaignSms({ campaignId, messageType, subject, content, duplicatePolicy }) {
  const res = await axiosInstance.post(`/api/campaigns/${campaignId}/send-sms`, {
    messageType,
    subject:         subject         ?? null,
    content,
    duplicatePolicy: duplicatePolicy ?? null,
  })
  return res.data.data
}

// ── 캠페인 문자 재발송 (실패 대상) ──
export async function retryCampaignSms({ campaignId, messageType, subject, content, duplicatePolicy }) {
  const res = await axiosInstance.post(`/api/campaigns/${campaignId}/retry-sms`, {
    messageType,
    subject:         subject         ?? null,
    content,
    duplicatePolicy: duplicatePolicy ?? null,
  })
  return res.data.data
}

// ── 캠페인 SMS 발송 현황 조회 ──
export async function getCampaignSmsStatus({ campaignId, cursor, date, time } = {}) {
  const params = {}
  if (cursor) params.cursor = cursor
  if (date)   params.date = date
  if (time)   params.time = time

  const res = await axiosInstance.get(`/api/campaigns/${campaignId}/sms-status`, { params })
  return res.data.data
}