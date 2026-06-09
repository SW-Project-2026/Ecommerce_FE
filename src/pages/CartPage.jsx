import { useState, useEffect } from 'react'
import { usePageView } from '../hooks/usePageView'
import { cartGet, cartDelete, cartUpdateQuantity } from '../api/carts'
import { clickCart } from '../api/snippets'
import { userCouponList } from '../api/coupons'

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

  const [cartItems,  setCartItems]  = useState([])
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  const [selected,   setSelected]   = useState(new Set())
  const [couponId,   setCouponId]   = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [coupons,    setCoupons]    = useState([])

  useEffect(() => { fetchCart() }, [])

  // ── 사용 가능 쿠폰 목록 조회 → userCouponList ──
  useEffect(() => {
    if (!auth) return
    userCouponList({ status: 'AVAILABLE', size: 100 })
      .then(data => setCoupons(data.content ?? []))
      .catch(() => {})
  }, [auth])

  async function fetchCart() {
    setLoading(true)
    setError(null)
    try {
      const data = await cartGet()
      const list = Array.isArray(data) ? data : []
      setCartItems(list)
      setSelected(new Set(list.map(i => i.cartId)))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const allSelected = cartItems.length > 0 && cartItems.every(i => selected.has(i.cartId))
  const selectedCount = selected.size

  function toggleAll() {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(cartItems.map(i => i.cartId)))
  }

  function toggleItem(cartId) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(cartId) ? next.delete(cartId) : next.add(cartId)
      return next
    })
  }

  async function handleQtyChange(cartId, newQty) {
    if (newQty < 1) return
    setUpdatingId(cartId)
    try {
      const updated = await cartUpdateQuantity({ cartId, quantity: newQty })
      setCartItems(prev => prev.map(i => i.cartId === cartId ? { ...i, quantity: updated.quantity, subtotal: updated.subtotal } : i))
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleRemoveItem(cartId) {
    const item = cartItems.find(i => i.cartId === cartId)
    try {
      await cartDelete({ cartId })
      setCartItems(prev => prev.filter(i => i.cartId !== cartId))
      setSelected(prev => { const next = new Set(prev); next.delete(cartId); return next })
      clickCart({
        productName:     item?.productName,
        productId:       item?.productId,
        productCategory: item?.productCategory ?? null,
        actionType:      'remove',
        userId:          auth.userId,
      })
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleRemoveSelected() {
    const targets = [...selected]
    const targetItems = cartItems.filter(i => selected.has(i.cartId))
    try {
      await Promise.all(targets.map(cartId => cartDelete({ cartId })))
      setCartItems(prev => prev.filter(i => !selected.has(i.cartId)))
      setSelected(new Set())
      targetItems.forEach(item => {
        clickCart({
          productName:     item.productName,
          productId:       item.productId,
          productCategory: item.productCategory ?? null,
          actionType:      'remove',
          userId:          auth.userId,
        })
      })
    } catch (err) {
      setError(err.message)
    }
  }

  const selectedItems  = cartItems.filter(i => selected.has(i.cartId))
  const subtotal       = selectedItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const appliedCoupon  = coupons.find(c => String(c.userCouponId) === couponId) ?? null
  const couponDiscount = appliedCoupon
    ? appliedCoupon.discountType === 'RATE'
      ? Math.min(Math.floor(subtotal * appliedCoupon.discountAmount / 100), appliedCoupon.maxDiscountAmount ?? Math.floor(subtotal * appliedCoupon.discountAmount / 100))
      : (appliedCoupon.discountAmount ?? 0)
    : 0
  const total = Math.max(0, subtotal - couponDiscount)

  function handleOrder() {
    if (selectedItems.length === 0) return
    const items = selectedItems.map(i => ({
      cartId: i.cartId,
      product: {
        productId:       i.productId,
        name:            i.productName,
        imageUrl:        i.imageUrl,
        minPrice:        i.unitPrice,
        productCategory: null,
      },
      qty: i.quantity,
    }))
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
                전체선택 ({selectedCount}/{cartItems.length})
              </label>
              <button className="cart-del-sel" onClick={handleRemoveSelected}>선택삭제</button>
            </div>

            {loading && <div className="cart-empty">불러오는 중...</div>}
            {error   && <div className="cart-empty" style={{ color: '#EF4444' }}>{error}</div>}
            {!loading && !error && cartItems.length === 0 && (
              <div className="cart-empty">장바구니가 비어있어요.</div>
            )}

            {cartItems.map(item => (
              <div key={item.cartId} className="cart-item">
                <input type="checkbox" className="cart-item-check"
                  checked={selected.has(item.cartId)} onChange={() => toggleItem(item.cartId)} />
                <div className="cart-item-img">
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.productName} />
                    : <div className="pdp-no-image" />}
                </div>
                <div className="cart-item-body">
                  <div className="cart-item-top">
                    <span className="cart-item-name">{item.productName}</span>
                    <button className="cart-item-del" onClick={() => handleRemoveItem(item.cartId)}>삭제</button>
                  </div>
                  <div className="cart-item-bottom">
                    <div className="cart-qty-ctrl">
                      <button onClick={() => handleQtyChange(item.cartId, item.quantity - 1)} disabled={item.quantity <= 1 || updatingId === item.cartId}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleQtyChange(item.cartId, item.quantity + 1)} disabled={updatingId === item.cartId}>+</button>
                    </div>
                    <span className="cart-item-price">{(item.unitPrice * item.quantity).toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        <div className="cart-right">
          <div className="cart-summary">
            <h3 className="cart-summary-title">주문 요약</h3>
            <div className="cart-summary-rows">
              <div className="cart-summary-row"><span>총 상품 금액</span><span>{subtotal.toLocaleString()}원</span></div>
              <div className="cart-summary-row"><span>배송비</span><span>+ 0원</span></div>
              {couponDiscount > 0 && (
                <div className="cart-summary-row" style={{ color: '#FF6B6B' }}>
                  <span>쿠폰 할인</span><span>-{couponDiscount.toLocaleString()}원</span>
                </div>
              )}
            </div>
            <div className="cart-summary-total">
              <span>최종 결제 금액</span>
              <span className="cart-total-price">{total.toLocaleString()}원</span>
            </div>
            <div className="cart-coupon-box">
              <select className="cart-coupon-select" value={couponId} onChange={e => setCouponId(e.target.value)}>
                <option value="">쿠폰 선택</option>
                {coupons.map(c => (
                  <option key={c.userCouponId} value={String(c.userCouponId)}>
                    {c.couponName} ({c.discountType === 'RATE' ? `${c.discountAmount}%` : `${c.discountAmount?.toLocaleString()}원`} 할인)
                  </option>
                ))}
              </select>
            </div>
            <button className="cart-order-btn" onClick={handleOrder} disabled={selectedCount === 0}>
              구매하기 ({selectedCount}개)
            </button>
            <button className="cart-continue-btn" onClick={() => onNavigate('home')}>계속 쇼핑하기</button>
          </div>
        </div>
      </div>
    </div>
  )
}