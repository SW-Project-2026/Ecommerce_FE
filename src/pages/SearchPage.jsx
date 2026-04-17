import { useEffect, useState } from 'react'
import { searchProducts } from '../api/products'

const DISPLAY = 20
const SORT_OPTIONS = [
  { value: 'sim',  label: '정확도순' },
  { value: 'date', label: '최신순' },
  { value: 'asc',  label: '가격 낮은순' },
  { value: 'dsc',  label: '가격 높은순' },
]

function ProductCard({ product }) {
  const [liked, setLiked] = useState(false)

  return (
    <a
      href={product.link}
      target="_blank"
      rel="noreferrer"
      className="sp-card"
    >
      <div className="sp-card-thumb">
        <img src={product.image} alt={product.title} loading="lazy" />
        <button
          className="sp-heart"
          onClick={e => { e.preventDefault(); setLiked(p => !p) }}
          aria-label="찜하기"
        >
          <i className={liked ? 'ri-heart-fill' : 'ri-heart-line'} style={{ color: '#FF6B6B' }} />
        </button>
      </div>
      <div className="sp-card-info">
        {product.mallName && <div className="sp-mall">{product.mallName}</div>}
        <div className="sp-title">{product.title}</div>
        <div className="sp-price">{Number(product.lowestPrice).toLocaleString()}원</div>
      </div>
    </a>
  )
}

function Pagination({ current, total, onChange }) {
  const pages = Math.min(Math.ceil(total / DISPLAY), 50)
  if (pages <= 1) return null

  const block = Math.floor((current - 1) / 3)
  const start = block * 3 + 1
  const end = Math.min(start + 2, pages)
  const nums = []
  for (let i = start; i <= end; i++) nums.push(i)

  return (
    <div className="sp-pagination">
      {nums.map(n => (
        <button
          key={n}
          className={`sp-page-btn${n === current ? ' active' : ''}`}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
      {end < pages && (
        <button className="sp-page-btn" onClick={() => onChange(end + 1)}>»</button>
      )}
    </div>
  )
}

export default function SearchPage({ query, onNavigate }) {
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('sim')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setPage(1)
  }, [query])

  useEffect(() => {
    if (!query) return
    setLoading(true)
    setError(null)
    const start = (page - 1) * DISPLAY + 1
    searchProducts({ query, display: DISPLAY, start, sort })
      .then(data => {
        setProducts(data.products)
        setTotal(data.total)
      })
      .catch(() => setError('상품을 불러오지 못했어요.'))
      .finally(() => setLoading(false))
  }, [query, page, sort])

  function handleSort(e) {
    setSort(e.target.value)
    setPage(1)
  }

  return (
    <div className="sp-wrap">
      {/* 결과바 */}
      <div className="sp-result-bar">
        <span className="sp-result-count">
          <b>"{query}"</b> 검색 결과
          {total > 0 && <span className="sp-total"> 총 {total.toLocaleString()}개</span>}
        </span>
        <select className="sp-sort" value={sort} onChange={handleSort}>
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* 상품 그리드 */}
      {loading && <div className="sp-status">검색 중...</div>}
      {error && <div className="sp-status sp-error">{error}</div>}
      {!loading && !error && products.length === 0 && (
        <div className="sp-status">검색 결과가 없어요.</div>
      )}
      {!loading && !error && products.length > 0 && (
        <div className="sp-grid">
          {products.map(p => <ProductCard key={p.productId} product={p} />)}
        </div>
      )}

      {/* 페이지네이션 */}
      <Pagination current={page} total={total} onChange={n => { setPage(n); window.scrollTo(0, 0) }} />
    </div>
  )
}
