import { useEffect, useState } from 'react'
import { getProduct } from '../api/products'

const RELATED_VISIBLE = 5

function Breadcrumb({ category, productName, onNavigate }) {
  return (
    <div className="pdp-breadcrumb">
      <span onClick={() => onNavigate('home')} className="pdp-bc-link">홈</span>
      <span className="pdp-bc-sep"> &gt; </span>
      {category && (
        <>
          <span onClick={() => onNavigate('list', category)} className="pdp-bc-link">{category.label}</span>
          <span className="pdp-bc-sep"> &gt; </span>
        </>
      )}
      <span className="pdp-bc-current">{productName}</span>
    </div>
  )
}

function RelatedProducts() {
  return (
    <div className="pdp-related">
      <h3 className="pdp-related-title">연관 상품</h3>
      <div className="pdp-related-row">
        <div className="pdp-related-grid">
          {Array.from({ length: RELATED_VISIBLE }).map((_, i) => (
            <div key={i} className="pdp-related-card">
              <div className="pdp-related-thumb pdp-no-image" />
              <div className="pdp-related-name pdp-skeleton" />
              <div className="pdp-related-price pdp-skeleton" />
            </div>
          ))}
        </div>
        <button className="pdp-related-arrow">
          <i className="ri-arrow-right-s-line" />
        </button>
      </div>
    </div>
  )
}

export default function ProductDetailPage({ productId, onNavigate, prevCategory }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('detail')
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    setQty(1)
    getProduct(productId)
      .then(data => setProduct(data))
      .catch(() => setError('상품을 불러오지 못했어요.'))
      .finally(() => setLoading(false))
  }, [productId])

  const total = product ? (product.price * qty).toLocaleString() : '0'

  if (loading) return <div className="sp-status">불러오는 중...</div>
  if (error) return <div className="sp-status sp-error">{error}</div>
  if (!product) return null

  const image = product.imageUrl ?? null
  const soldOut = product.stockQuantity === 0

  return (
    <div className="pdp-wrap">
      <Breadcrumb
        category={prevCategory}
        productName={product.name}
        onNavigate={onNavigate}
      />

      <div className="pdp-content">
        <div className="pdp-gallery">
          <div className="pdp-main-img">
            {image
              ? <img src={image} alt={product.name} />
              : <div className="pdp-no-image" />}
          </div>
        </div>

        <div className="pdp-info">
          {product.productCategory && (
            <div className="pdp-brand">{product.productCategory}</div>
          )}
          <h1 className="pdp-name">{product.name}</h1>

          <div className="pdp-price-area">
            <span className="pdp-price">{product.price.toLocaleString()}원</span>
          </div>

          <div className="pdp-info-box">
            <div className="pdp-info-row">
              <span className="pdp-info-label">반품/교환</span>
              <span className="pdp-info-value">무료 반품 (수령 후 30일 이내)</span>
            </div>
            <div className="pdp-info-row">
              <span className="pdp-info-label">배송비</span>
              <span className="pdp-info-value pdp-free-ship">무료배송</span>
            </div>
          </div>

          <div className="pdp-qty-row">
            <span className="pdp-qty-label">수량</span>
            <div className="pdp-qty-ctrl">
              <button
                className="pdp-qty-btn"
                onClick={() => setQty(q => Math.max(1, q - 1))}
                disabled={qty <= 1}
              >−</button>
              <span className="pdp-qty-num">{qty}</span>
              <button
                className="pdp-qty-btn"
                onClick={() => setQty(q => q + 1)}
                disabled={soldOut || qty >= product.stockQuantity}
              >+</button>
            </div>
          </div>

          <div className="pdp-total-row">
            <span className="pdp-total-label">총 상품금액</span>
            <span className="pdp-total-price">{total}원</span>
          </div>

          <button className="pdp-buy-btn" disabled={soldOut}>
            {soldOut ? '품절' : '바로 구매하기'}
          </button>
          <div className="pdp-sub-btns">
            <button className="pdp-cart-btn" disabled={soldOut}>장바구니 담기</button>
            <button
              className={`pdp-like-btn${liked ? ' active' : ''}`}
              onClick={() => setLiked(p => !p)}
            >
              <i className={liked ? 'ri-heart-fill' : 'ri-heart-line'} /> 찜하기
            </button>
          </div>
        </div>
      </div>

      <div className="pdp-tabs">
        {[
          { key: 'detail', label: '상품 상세' },
          { key: 'review', label: '리뷰' },
          { key: 'return', label: '배송/반품/교환' },
        ].map(tab => (
          <button
            key={tab.key}
            className={`pdp-tab${activeTab === tab.key ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pdp-tab-content">
        {activeTab === 'detail' && (
          <p className="pdp-desc">
            {product.description || '상품 상세 정보가 없습니다.'}
          </p>
        )}
        {activeTab === 'review' && (
          <p className="pdp-desc pdp-placeholder">아직 리뷰가 없습니다.</p>
        )}
        {activeTab === 'return' && (
          <div className="pdp-desc">
            <p>· 반품/교환: 수령 후 30일 이내 무료</p>
            <p>· 배송비: 무료배송</p>
          </div>
        )}
      </div>

      <RelatedProducts />
    </div>
  )
}
