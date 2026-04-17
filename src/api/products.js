const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export async function searchProducts({ query, display = 10, start = 1, sort = 'sim' }) {
  const params = new URLSearchParams({ query, display, start, sort })
  const res = await fetch(`${BASE}/api/products/search?${params}`)
  if (!res.ok) throw new Error('상품 검색 실패')
  const json = await res.json()
  return json.data
}
