import { useEffect, useState } from 'react'
import { getProduct } from '../api/products'

export default function ProductDetailPage({ productId, onNavigate, prevCategory }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mainImg, setMainImg] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getProduct(productId)
      .then(data => setProduct(data))
      .catch(() => setError('상품을 불러오지 못했어요.'))
      .finally(() => setLoading(false))
  }, [productId])

  function handleBack() {
    if (prevCategory) {
      onNavigate('list', prevCategory)
    } else {
      onNavigate('home')
    }
  }

  return (
    <div className="pdp-wrap">
      <button className="pdp-back" onClick={handleBack}>
        <i className="ri-arrow-left-line" /> 뒤로가기
      </button>

      {loading && <div className="sp-status">불러오는 중...</div>}
      {error && <div className="sp-status sp-error">{error}</div>}

      {product && (
        <div className="pdp-content">
          {/* 이미지 영역 */}
          <div className="pdp-gallery">
            <div className="pdp-main-img">
              {product.imageUrls?.length > 0
                ? <img src={product.imageUrls[mainImg]} alt={product.name} />
                : <div className="pdp-no-image" />}
            </div>
            {product.imageUrls?.length > 1 && (
              <div className="pdp-thumbs">
                {product.imageUrls.map((url, i) => (
                  <button
                    key={i}
                    className={`pdp-thumb${i === mainImg ? ' active' : ''}`}
                    onClick={() => setMainImg(i)}
                  >
                    <img src={url} alt={`${product.name} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 상품 정보 */}
          <div className="pdp-info">
            {product.productCategory && (
              <span className="pdp-category">{product.productCategory}</span>
            )}
            <h1 className="pdp-name">{product.name}</h1>
            <div className="pdp-price">{product.price.toLocaleString()}원</div>
            {product.description && (
              <p className="pdp-desc">{product.description}</p>
            )}
            <div className="pdp-stock">
              재고: {product.stockQuantity > 0
                ? <span className="pdp-stock-ok">{product.stockQuantity}개</span>
                : <span className="pdp-stock-none">품절</span>}
            </div>
            <button
              className="pdp-buy-btn"
              disabled={product.stockQuantity === 0}
            >
              구매하기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
