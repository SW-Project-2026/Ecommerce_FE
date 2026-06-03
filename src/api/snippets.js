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
        user_login_id:   userId,
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
      user_login_id:   userId,
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
      user_login_id:   userId,
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
      user_login_id:   userId,
      event_timestamp: getKSTTimestamp()
    })
  })
}

// ── 찜 추가/제거 ──
// actionType: 'add' | 'remove'
export const clickWishlist = async ({ productName, productId, productCategory = null, actionType, userId = null }) => {
  await fetch(`${FLUENTD_URL}/kafka.logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_name:      'wishlist_click',
      productName:     productName,
      productId:       productId,
      productCategory: productCategory,
      actionType:      actionType,
      event_timestamp: getKSTTimestamp(),
      user_login_id:   userId,
    })
  })
}

// ── 장바구니 추가/제거 ──
// actionType: 'add' | 'remove'
export const clickCart = async ({ productName, productId, productCategory = null, actionType, userId = null }) => {
  await fetch(`${FLUENTD_URL}/kafka.logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_name:      'cart_click',
      productName:     productName,
      productId:       productId,
      productCategory: productCategory,
      actionType:      actionType,
      event_timestamp: getKSTTimestamp(),
      user_login_id:   userId,
    })
  })
}

// ── 로그인 ──
export const userLogin = async ({ userId }) => {
  await fetch(`${FLUENTD_URL}/kafka.logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_name:      'login',
      user_login_id:   userId,
      event_timestamp: getKSTTimestamp(),
    })
  })
}

// ── 로그아웃 ──
export const userLogout = async ({ userId }) => {
  await fetch(`${FLUENTD_URL}/kafka.logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_name:      'logout',
      user_login_id:   userId,
      event_timestamp: getKSTTimestamp(),
    })
  })
}

export { INACTIVE_THRESHOLD }