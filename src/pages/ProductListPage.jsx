import { useEffect, useState } from 'react'
import { searchProducts, getProducts } from '../api/products'
import { usePageView } from '../hooks/usePageView'
import { wishlistAdd, wishlistDelete } from '../api/wishlists'

const DISPLAY = 20
const NAVER_SORT_OPTIONS = [
  { value: 'sim',  label: '정확도순' },
  { value: 'date', label: '최신순' },
  { value: 'asc',  label: '가격 낮은순' },
  { value: 'dsc',  label: '가격 높은순' },
]

function DbCard({ product, onNavigate, auth }) {
  const [liked,  setLiked]  = useState(false)
  const [wishId, setWishId] = useState(null) // 찜 삭제 시 필요한 wishId
  const image = product.imageUrl ?? product.image

  async function handleLike(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!auth) {
      onNavigate?.('login')
      return
    }
    try {
      if (liked) {
        // 찜 취소 → DELETE
        await wishlistDelete({ wishId })
        setLiked(false)
        setWishId(null)
      } else {
        // 찜 추가 → POST
        const data = await wishlistAdd({ productId: product.productId })
        setLiked(true)
        setWishId(data.wishId)
      }
    } catch (err) {
      console.error('찜 처리 실패:', err.message)
    }
  }

  return (
    <div className="sp-card" onClick={() => onNavigate?.('product', product.productId)} style={{ cursor: 'pointer' }}>
      <div className="sp-card-thumb">
        {image
          ? <img src={image} alt={product.name ?? product.title} loading="lazy" />
          : <div className="sp-no-image" />}
        <button className="sp-heart" onClick={handleLike} aria-label="찜하기">
          <i className={liked ? 'ri-heart-fill' : 'ri-heart-line'} style={{ color: '#FF6B6B' }} />
        </button>
      </div>
      <div className="sp-card-info">
        {(product.productCategory ?? product.mallName) && (
          <div className="sp-mall">{product.productCategory ?? product.mallName}</div>
        )}
        <div className="sp-title">{product.name ?? product.title}</div>
        <div className="sp-price">{((product.minPrice ?? Number(product.lowestPrice)) || 0).toLocaleString()}원</div>
      </div>
    </div>
  )
}

function Pagination({ current, totalPages, onChange }) {
  if (totalPages <= 1) return null
  const block = Math.floor((current - 1) / 3)
  const start = block * 3 + 1
  const end = Math.min(start + 2, totalPages)
  const nums = []
  for (let i = start; i <= end; i++) nums.push(i)

  return (
    <div className="sp-pagination">
      {nums.map(n => (
        <button key={n} className={`sp-page-btn${n === current ? ' active' : ''}`} onClick={() => onChange(n)}>{n}</button>
      ))}
      {end < totalPages && (
        <button className="sp-page-btn" onClick={() => onChange(end + 1)}>»</button>
      )}
    </div>
  )
}

export default function SearchPage({ query, category, onNavigate, userId = null, auth = null }) {
  usePageView('상품목록', userId)

  const [products,   setProducts]   = useState([])
  const [total,      setTotal]      = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page,       setPage]       = useState(1)
  const [sort,       setSort]       = useState('sim')
  const [dbSort,     setDbSort]     = useState('createdAt,desc')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)

  const isSearch = !!query
  const isList = !query && category?.id && category.id !== 'home'

  useEffect(() => {
    setPage(1)
    setSort('sim')
    setDbSort('createdAt,desc')
  }, [query, category])

  useEffect(() => {
    if (isSearch) {
      setLoading(true)
      setError(null)
      const start = (page - 1) * DISPLAY + 1
      searchProducts({ query, display: DISPLAY, start, sort })
        .then(data => {
          setProducts(data.products)
          setTotal(data.total)
          setTotalPages(Math.min(Math.ceil(data.total / DISPLAY), 50))
        })
        .catch(() => setError('상품을 불러오지 못했어요.'))
        .finally(() => setLoading(false))
      return
    }

    if (isList) {
      setLoading(true)
      setError(null)
      const cat = category?.id !== 'all' ? (category?.dbKey ?? category?.label) : undefined
      getProducts({ page: page - 1, size: DISPLAY, category: cat, sort: dbSort })
        .then(data => {
          setProducts(data.content)
          setTotal(data.totalElements)
          setTotalPages(data.totalPages)
        })
        .catch(() => setError('상품을 불러오지 못했어요.'))
        .finally(() => setLoading(false))
    }
  }, [query, category, page, sort, dbSort])

  function handleSort(e) { setSort(e.target.value); setPage(1) }
  function handleDbSort(value) { setDbSort(value); setPage(1) }

  const resultLabel = isSearch
    ? <><b>"{query}"</b> 검색 결과</>
    : <><b>{category?.label}</b> 상품</>

  return (
    <div className="sp-wrap">
      <div className="pdp-breadcrumb" style={{ marginBottom: 16 }}>
        <span onClick={() => onNavigate('home')} className="pdp-bc-link">홈</span>
        {isList && category?.label && (
          <>
            <span className="pdp-bc-sep"> &gt; </span>
            <span className="pdp-bc-current">{category.label}</span>
          </>
        )}
        {isSearch && (
          <>
            <span className="pdp-bc-sep"> &gt; </span>
            <span className="pdp-bc-current">검색: {query}</span>
          </>
        )}
      </div>

      <div className="sp-result-bar">
        <span className="sp-result-count">
          {resultLabel}
          {total > 0 && <span className="sp-total"> 총 {total.toLocaleString()}개</span>}
        </span>
        {isSearch && (
          <select className="sp-sort" value={sort} onChange={handleSort}>
            {NAVER_SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        )}
        {isList && (
          <div className="sp-db-sort">
            {[
              { value: 'createdAt,desc', label: '유사도순' },
              { value: 'createdAt,asc',  label: '최신순' },
              { value: 'price,asc',      label: '낮은가격' },
              { value: 'price,desc',     label: '높은가격' },
            ].map((o, i, arr) => (
              <span key={o.value} className="sp-db-sort-item">
                <button className={`sp-db-sort-btn${dbSort === o.value ? ' active' : ''}`} onClick={() => handleDbSort(o.value)}>{o.label}</button>
                {i < arr.length - 1 && <span className="sp-db-sort-divider">|</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {loading && <div className="sp-status">불러오는 중...</div>}
      {error && <div className="sp-status sp-error">{error}</div>}
      {!loading && !error && !isSearch && !isList && <div className="sp-status">검색어 또는 카테고리를 선택해주세요.</div>}
      {!loading && !error && (isSearch || isList) && products.length === 0 && <div className="sp-status">상품이 없어요.</div>}
      {!loading && !error && products.length > 0 && (
        <div className="sp-grid">
          {products.map(p => (
            <DbCard key={p.productId} product={p} onNavigate={onNavigate} auth={auth} />
          ))}
        </div>
      )}

      <Pagination current={page} totalPages={totalPages} onChange={n => { setPage(n); window.scrollTo(0, 0) }} />
    </div>
  )
}