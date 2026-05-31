const FLUENTD_URL = import.meta.env.VITE_FLUENTD_URL || 'http://localhost:9880'

let timer = null
const INACTIVE_THRESHOLD = 5000

function getKSTTimestamp() {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return kst.toISOString().replace('Z', '+09:00')
}

export const clickSearchButton = async (query, userId = null) => {
  if (!query.trim()) return

  if (timer) clearTimeout(timer)

  timer = setTimeout(async () => {
    await fetch(`${FLUENTD_URL}/kafka.logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name:      'search_button_click',
        searchKeyword:   query,
        user_id:         userId,
        event_timestamp: getKSTTimestamp()
      })
    })
  }, 500)
}

export const clickPurchaseButton = async ({ approvedAmount, productName, productId, productCategory = null, userId = null }) => {
  await fetch(`${FLUENTD_URL}/kafka.logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_name:      'purchase_button_click',
      approvedAmount:  approvedAmount,
      productName:     productName,
      productId:       productId,
      productCategory: productCategory,
      user_id:         userId,
      event_timestamp: getKSTTimestamp()
    })
  })
}

export const viewProductDetail = async ({ productName, productId, dwellTime, productCategory = null, userId = null }) => {
  await fetch(`${FLUENTD_URL}/kafka.logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_name:      'product_detail_view',
      productName:     productName,
      productId:       productId,
      dwellTime:       dwellTime,
      productCategory: productCategory,
      user_id:         userId,
      event_timestamp: getKSTTimestamp()
    })
  })
}

export const pageView = async ({ pageName, dwellTime, userId = null }) => {
  await fetch(`${FLUENTD_URL}/kafka.logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_name:      'page_view',
      pageName:        pageName,
      dwellTime:       dwellTime,
      user_id:         userId,
      event_timestamp: getKSTTimestamp()
    })
  })
}

export { INACTIVE_THRESHOLD }