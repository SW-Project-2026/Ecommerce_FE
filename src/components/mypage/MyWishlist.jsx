import { useState, useEffect } from 'react'
import { wishlistGet, wishlistDelete } from '../../api/wishlists'

export default function MyWishlist({ onNavigate }) {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [cursor,  setCursor]  = useState(null)
  const [hasNext, setHasNext] = useState(false)

  useEffect(() => { fetchWishlist() }, [])

  async function fetchWishlist(nextCursor = null) {
    setLoading(true)
    setError(null)
    try {
      const data = await wishlistGet({ cursor: nextCursor, size: 20 })
      const content = data.content ?? []
      setItems(prev => nextCursor ? [...prev, ...content] : content)
      setCursor(data.nextCursor ?? null)
      setHasNext(data.hasNext ?? false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRemove(wishId) {
    try {
      await wishlistDelete({ wishId })
      setItems(prev => prev.filter(i => i.wishId !== wishId))
    } catch (err) {
      setError(err.message)
    }
  }

  if (!loading && items.length === 0 && !error) return (
    <div className="myp-section">
      <div className="myp-section-title"><i className="ri-heart-line" />찜한 상품</div>
      <div className="myp-empty">
        <i className="ri-heart-line" />
        찜한 상품이 없어요
      </div>
    </div>
  )

  return (
    <div className="myp-section">
      <div className="myp-section-title">
        <i className="ri-heart-line" />
        찜한 상품
        <span style={{ fontSize: 12, fontWeight: 400, color: '#9E9E9E', marginLeft: 4 }}>
          ({items.length}개)
        </span>
      </div>

      {loading && items.length === 0 && <div style={{ fontSize: 13, color: '#9EA6B4', padding: '16px 0' }}>불러오는 중...</div>}
      {error && <div style={{ fontSize: 13, color: '#EF4444', padding: '8px 0' }}>{error}</div>}

      <div className="myp-wishlist-grid">
        {items.map(item => (
          <div className="myp-wishlist-card" key={item.wishId} onClick={() => onNavigate('product', item.productId)}>
            <div className="myp-wishlist-thumb">
              {item.imageUrl
                ? <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                : <div style={{ width: '100%', height: '100%', background: '#F0F0F0', borderRadius: 8 }} />
              }
              <button
                className="myp-wishlist-del"
                onClick={e => { e.stopPropagation(); handleRemove(item.wishId) }}
                aria-label="찜 해제"
              >
                <i className="ri-close-line" />
              </button>
            </div>
            <div className="myp-wishlist-name">{item.productName}</div>
            <div className="myp-wishlist-price">{item.minPrice?.toLocaleString()}원</div>
          </div>
        ))}
      </div>

      {hasNext && (
        <button
          onClick={() => fetchWishlist(cursor)}
          disabled={loading}
          style={{ marginTop: 16, width: '100%', height: 40, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer', background: '#fff' }}
        >
          {loading ? '불러오는 중...' : '더보기'}
        </button>
      )}
    </div>
  )
}