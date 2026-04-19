const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export async function searchProducts({ query, display = 10, start = 1, sort = 'sim' }) {
  const params = new URLSearchParams({ query, display, start, sort })
  const res = await fetch(`${BASE}/api/products/search?${params}`)
  if (!res.ok) throw new Error('상품 검색 실패')
  const json = await res.json()
  return json.data
}

export async function getProducts({ page = 0, size = 20, category } = {}) {
  const params = new URLSearchParams({ page, size, sort: 'createdAt,desc' })
  if (category) params.append('category', category)
  const res = await fetch(`${BASE}/api/products?${params}`)
  if (!res.ok) throw new Error('상품 목록 조회 실패')
  const json = await res.json()
  return json.data
}

export async function getProduct(productId) {
  const res = await fetch(`${BASE}/api/products/${productId}`)
  if (!res.ok) throw new Error('상품 조회 실패')
  const json = await res.json()
  return json.data
}
