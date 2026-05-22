import { useState } from 'react'
import { usePageView } from '../hooks/usePageView'

const MOCK_COUPONS = [
  { id: 'c1', name: '신규가입 5,000원 할인', discountAmount: 5000 },
  { id: 'c2', name: '여름 시즌 3,000원 할인', discountAmount: 3000 },
  { id: 'c3', name: '첫 구매 10% 할인 (최대 10,000원)', discountAmount: 10000 },
]

function ProgressBar({ step }) {
  const steps = ['장바구니', '주문/결제', '주문 완료']
  return (
    <div className="checkout-progress">
      {steps.map((label, i) => {
        const num = i + 1
        const done = num < step
        const active = num === step
        return (
          <div key={i} className="cp-step-wrap">
            <div className={`cp-step${active ? ' active' : done ? ' done' : ''}`}>
              <div className="cp-circle">
                {done ? <i className="ri-check-line" /> : num}
              </div>
              <div className="cp-label">{label}</div>
            </div>
            {i < steps.length - 1 && <div className="cp-line" />}
          </div>
        )
      })}
    </div>
  )
}

export default function CartPage({ cart, onNavigate, onCartChange, onGoCheckout, auth }) {
  usePageView('장바구니', auth?.userId ?? null)

  const [selected, setSelected] = useState(() => new Set(cart.map(i => i.product.productId)))
  const [qtys, setQtys] = useState(() =>
    Object.fromEntries(cart.map(i => [i.product.productId, i.qty]))
  )
  const [couponId, setCouponId] = useState('')

  const allSelected = cart.length > 0 && cart.every(i => selected.has(i.product.productId))
  const selectedCount = selected.size

  function toggleAll() {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(cart.map(i => i.product.productId)))
  }

  function toggleItem(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function setQty(id, val) {
    setQtys(prev => ({ ...prev, [id]: Math.max(1, val) }))
  }

  function removeItem(id) {
    onCartChange(cart.filter(i => i.product.productId !== id))
    setSelected(prev => { const next = new Set(prev); next.delete(id); return next })
  }

  function removeSelected() {
    onCartChange(cart.filter(i => !selected.has(i.product.productId)))
    setSelected(new Set())
  }

  const selectedItems = cart.filter(i => selected.has(i.product.productId))
  const subtotal = selectedItems.reduce((s, i) => s + i.product.minPrice * qtys[i.product.productId], 0)

  const appliedCoupon = MOCK_COUPONS.find(c => c.id === couponId) ?? null
  const couponDiscount = appliedCoupon?.discountAmount ?? 0
  const total = Math.max(0, subtotal - couponDiscount)

  function handleOrder() {
    if (selectedItems.length === 0) return
    const items = selectedItems.map(i => ({
      product: i.product,
      qty: qtys[i.product.productId],
    }))
    // clickPurchaseButton 스니펫은 CheckoutPage 결제하기 버튼으로 이동됨
    onGoCheckout({ items, coupon: appliedCoupon })
  }

  return (
    <div className="checkout-page">
      <ProgressBar step={1} />

      <div className="cart-layout">
        <div className="cart-left">
          <div className="cart-card">
            <div className="cart-header">
              <label className="cart-check-all">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                전체선택 ({selectedCount}/{cart.length})
              </label>
              <button className="cart-del-sel" onClick={removeSelected}>선택삭제</button>
            </div>

            {cart.length === 0 && (
              <div className="cart-empty">장바구니가 비어있어요.</div>
            )}

            {cart.map(item => {
              const p = item.product
              const qty = qtys[p.productId]
              return (
                <div key={p.productId} className="cart-item">
                  <input
                    type="checkbox"
                    className="cart-item-check"
                    checked={selected.has(p.productId)}
                    onChange={() => toggleItem(p.productId)}
                  />
                  <div className="cart-item-img">
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} />
                      : <div className="pdp-no-image" />}
                  </div>
                  <div className="cart-item-body">
                    <div className="cart-item-top">
                      <span className="cart-item-name">{p.name}</span>
                      <button className="cart-item-del" onClick={() => removeItem(p.productId)}>삭제</button>
                    </div>
                    <div className="cart-item-bottom">
                      <div className="cart-qty-ctrl">
                        <button onClick={() => setQty(p.productId, qty - 1)} disabled={qty <= 1}>−</button>
                        <span>{qty}</span>
                        <button onClick={() => setQty(p.productId, qty + 1)}>+</button>
                      </div>
                      <span className="cart-item-price">{(p.minPrice * qty).toLocaleString()}원</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="cart-related">
            <h3 className="cart-related-title">다른 고객이 함께 구매한 상품</h3>
            <div className="cart-related-row">
              <div className="cart-related-grid">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="cart-related-card">
                    <div className="cart-related-thumb" />
                    <div className="cart-related-name pdp-skeleton" />
                    <div className="cart-related-price pdp-skeleton" />
                  </div>
                ))}
              </div>
              <button className="pdp-related-arrow">
                <i className="ri-arrow-right-s-line" />
              </button>
            </div>
          </div>
        </div>

        <div className="cart-right">
          <div className="cart-summary">
            <h3 className="cart-summary-title">주문 요약</h3>
            <div className="cart-summary-rows">
              <div className="cart-summary-row">
                <span>총 상품 금액</span>
                <span>{subtotal.toLocaleString()}원</span>
              </div>
              <div className="cart-summary-row">
                <span>배송비</span>
                <span>+ 0원</span>
              </div>
              {couponDiscount > 0 && (
                <div className="cart-summary-row" style={{ color: '#FF6B6B' }}>
                  <span>쿠폰 할인</span>
                  <span>-{couponDiscount.toLocaleString()}원</span>
                </div>
              )}
            </div>
            <div className="cart-summary-total">
              <span>최종 결제 금액</span>
              <span className="cart-total-price">{total.toLocaleString()}원</span>
            </div>

            <div className="cart-coupon-box">
              <select
                className="cart-coupon-select"
                value={couponId}
                onChange={e => setCouponId(e.target.value)}
              >
                <option value="">쿠폰 선택</option>
                {MOCK_COUPONS.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <button
              className="cart-order-btn"
              onClick={handleOrder}
              disabled={selectedCount === 0}
            >
              구매하기 ({selectedCount}개)
            </button>
            <button className="cart-continue-btn" onClick={() => onNavigate('home')}>
              계속 쇼핑하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}