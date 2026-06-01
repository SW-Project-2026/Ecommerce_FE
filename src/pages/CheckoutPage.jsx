import { useState, useEffect } from 'react'
import { usePageView } from '../hooks/usePageView'
import { clickPurchaseButton } from '../api/snippets'
import { addressList, addressCreate } from '../api/addresses'
import { cartDelete } from '../api/carts'
import { orderCreate } from '../api/orders'
import './CheckoutPage.css'

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
              <div className="cp-circle">{done ? <i className="ri-check-line" /> : num}</div>
              <div className="cp-label">{label}</div>
            </div>
            {i < steps.length - 1 && <div className="cp-line" />}
          </div>
        )
      })}
    </div>
  )
}

const PAY_METHODS = [
  { key: 'kakao', label: '카카오페이', icon: '💛', className: 'kakao' },
  { key: 'card',  label: '신용카드',   icon: '💳', className: '' },
  { key: 'bank',  label: '무통장입금', icon: '🏦', className: '' },
]

const EMPTY_ADDR_FORM = { road: '', detail: '' }

export default function CheckoutPage({ checkoutItems, selectedCoupon, onNavigate, onOrderComplete, auth }) {
  usePageView('주문결제', auth?.userId ?? null)

  const [addresses,      setAddresses]      = useState([])
  const [addrLoading,    setAddrLoading]    = useState(false)
  const [selectedAddrId, setSelectedAddrId] = useState(null)
  const [showAddrPicker, setShowAddrPicker] = useState(false)
  const [showAddrForm,   setShowAddrForm]   = useState(false)
  const [addrForm,       setAddrForm]       = useState(EMPTY_ADDR_FORM)
  const [addrError,      setAddrError]      = useState(null)
  const [orderError,     setOrderError]     = useState(null)
  const [ordering,       setOrdering]       = useState(false)

  useEffect(() => {
    async function fetchAddresses() {
      setAddrLoading(true)
      try {
        const data = await addressList()
        const list = Array.isArray(data) ? data : []
        setAddresses(list)
        const def = list.find(a => a.default) ?? list[0] ?? null
        if (def) setSelectedAddrId(def.addressId)
      } catch (err) {
        setAddrError(err.message)
      } finally {
        setAddrLoading(false)
      }
    }
    fetchAddresses()
  }, [])

  const selectedAddr = addresses.find(a => a.addressId === selectedAddrId) ?? null
  const [payMethod, setPayMethod] = useState('kakao')

  const subtotal = checkoutItems.reduce((s, i) => s + i.product.minPrice * i.qty, 0)
  const couponDiscount = selectedCoupon?.discountAmount ?? 0
  const total = Math.max(0, subtotal - couponDiscount)
  const canOrder = selectedAddr !== null && payMethod && !ordering

  async function handleAddrAdd() {
    if (!addrForm.road.trim()) return
    try {
      const newAddr = await addressCreate({
        roadNameAddress: addrForm.road,
        addressDetail:   addrForm.detail,
        isDefault:       addresses.length === 0,
      })
      setAddresses(prev => [...prev, newAddr])
      setSelectedAddrId(newAddr.addressId)
      setAddrForm(EMPTY_ADDR_FORM)
      setShowAddrForm(false)
      setShowAddrPicker(false)
    } catch (err) {
      setAddrError(err.message)
    }
  }

  async function handleOrder() {
    if (!canOrder) return
    setOrdering(true)
    setOrderError(null)

    try {
      // 1. 스니펫 전송
      for (const item of checkoutItems) {
        await clickPurchaseButton({
          approvedAmount:  item.product.minPrice * item.qty,
          productName:     item.product.name,
          productId:       item.product.productId,
          productCategory: item.product.productCategory ?? null,
          userId:          auth?.userId ?? null,
        })
      }

      // 2. 주문 생성 → POST /api/orders
      await orderCreate({
        addressId:    selectedAddrId,
        userCouponId: selectedCoupon?.userCouponId ?? null,
        items:        checkoutItems.map(i => ({
          productId: i.product.productId,
          quantity:  i.qty,
        })),
      })

      // 3. 장바구니에서 결제된 상품 삭제
      const cartIds = checkoutItems.map(i => i.cartId).filter(Boolean)
      if (cartIds.length > 0) {
        await Promise.all(cartIds.map(cartId => cartDelete({ cartId })))
      }

      onOrderComplete({
        items:     checkoutItems,
        qtys:      Object.fromEntries(checkoutItems.map(i => [i.product.productId, i.qty])),
        total,
        payMethod: PAY_METHODS.find(m => m.key === payMethod)?.label ?? payMethod,
      })
      onNavigate('order-complete')
    } catch (err) {
      setOrderError(err.message)
    } finally {
      setOrdering(false)
    }
  }

  return (
    <div className="checkout-page">
      <ProgressBar step={2} />
      <div className="co-layout">
        <div className="co-left">

          {/* 배송지 */}
          <div className="co-card">
            <div className="co-card-header">
              <div className="co-card-indicator" />
              <span className="co-card-title">배송지 정보</span>
              {addresses.length > 0 && !showAddrForm && (
                <button className="co-addr-change-btn" onClick={() => { setShowAddrPicker(p => !p); setShowAddrForm(false) }} type="button">
                  {showAddrPicker ? '닫기' : '변경'}
                </button>
              )}
            </div>
            <div className="co-card-body">
              {addrLoading && <p style={{ fontSize: 13, color: '#9EA6B4' }}>불러오는 중...</p>}
              {addrError   && <p style={{ fontSize: 13, color: '#EF4444' }}>{addrError}</p>}

              {!addrLoading && addresses.length === 0 && !showAddrForm && (
                <div className="co-addr-empty">
                  <i className="ri-map-pin-line" />
                  <p>등록된 배송지가 없습니다.</p>
                  <button className="co-addr-goto-btn" onClick={() => setShowAddrForm(true)} type="button">
                    <i className="ri-add-line" /> 배송지 추가하기
                  </button>
                </div>
              )}

              {selectedAddr && !showAddrPicker && !showAddrForm && (
                <div className="co-addr-selected">
                  {selectedAddr.default && <span className="co-addr-default-badge">기본 배송지</span>}
                  <p className="co-addr-road">{selectedAddr.roadNameAddress}</p>
                  {selectedAddr.addressDetail && <p className="co-addr-detail">{selectedAddr.addressDetail}</p>}
                </div>
              )}

              {showAddrPicker && !showAddrForm && (
                <div className="co-addr-picker">
                  {addresses.map(addr => (
                    <div key={addr.addressId} className={`co-addr-option${selectedAddrId === addr.addressId ? ' selected' : ''}`}
                      onClick={() => { setSelectedAddrId(addr.addressId); setShowAddrPicker(false) }}>
                      <div className="co-addr-option-radio">
                        {selectedAddrId === addr.addressId
                          ? <i className="ri-radio-button-fill" />
                          : <i className="ri-checkbox-blank-circle-line" />}
                      </div>
                      <div className="co-addr-option-info">
                        {addr.default && <span className="co-addr-default-badge">기본 배송지</span>}
                        <p className="co-addr-road">{addr.roadNameAddress}</p>
                        {addr.addressDetail && <p className="co-addr-detail">{addr.addressDetail}</p>}
                      </div>
                    </div>
                  ))}
                  <button className="co-addr-goto-btn" onClick={() => setShowAddrForm(true)} type="button">
                    <i className="ri-add-line" /> 새 배송지 추가하기
                  </button>
                </div>
              )}

              {showAddrForm && (
                <div className="co-addr-form">
                  <p className="co-addr-form-title">새 배송지 추가</p>
                  <div className="co-form-group">
                    <label>도로명 주소</label>
                    <input type="text" placeholder="도로명 주소를 입력해주세요" value={addrForm.road} onChange={e => setAddrForm(p => ({ ...p, road: e.target.value }))} />
                  </div>
                  <div className="co-form-group">
                    <label>상세 주소</label>
                    <input type="text" placeholder="동, 호수 등 상세 주소" value={addrForm.detail} onChange={e => setAddrForm(p => ({ ...p, detail: e.target.value }))} />
                  </div>
                  <div className="co-addr-form-btns">
                    <button className="co-addr-form-save" onClick={handleAddrAdd} type="button" disabled={!addrForm.road.trim()}>추가하기</button>
                    <button className="co-addr-form-cancel" onClick={() => { setShowAddrForm(false); setAddrForm(EMPTY_ADDR_FORM) }} type="button">취소</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 주문 상품 */}
          <div className="co-card">
            <div className="co-card-header">
              <div className="co-card-indicator" />
              <span className="co-card-title">주문 상품 ({checkoutItems.length}개)</span>
            </div>
            <div className="co-card-body">
              {checkoutItems.map(({ product, qty }) => (
                <div key={product.productId} className="co-item">
                  <div className="co-item-img">
                    {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <div className="co-item-no-img" />}
                  </div>
                  <div className="co-item-info">
                    <div className="co-item-name">{product.name}</div>
                    <div className="co-item-qty">{qty}개</div>
                  </div>
                  <span className="co-item-price">{(product.minPrice * qty).toLocaleString()}원</span>
                </div>
              ))}
            </div>
          </div>

          {/* 쿠폰 */}
          <div className="co-card">
            <div className="co-card-header">
              <div className="co-card-indicator" />
              <span className="co-card-title">쿠폰</span>
            </div>
            <div className="co-card-body">
              <div className="co-coupon-row">
                <span>적용 쿠폰</span>
                {selectedCoupon ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="co-coupon-applied">🎫 {selectedCoupon.name}</span>
                    <span className="co-coupon-discount">-{couponDiscount.toLocaleString()}원</span>
                  </div>
                ) : (
                  <span className="co-coupon-none">적용된 쿠폰 없음</span>
                )}
              </div>
            </div>
          </div>

          {/* 결제 수단 */}
          <div className="co-card">
            <div className="co-card-header">
              <div className="co-card-indicator" />
              <span className="co-card-title">결제 수단</span>
            </div>
            <div className="co-card-body">
              <div className="co-pay-methods">
                {PAY_METHODS.map(m => (
                  <button key={m.key} className={`co-pay-btn ${m.className}${payMethod === m.key ? ' active' : ''}`}
                    onClick={() => setPayMethod(m.key)} type="button">
                    <span className="co-pay-icon">{m.icon}</span>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽 요약 */}
        <div className="co-right">
          <div className="co-summary">
            <h3 className="co-summary-title">결제 금액</h3>
            <div className="co-summary-rows">
              <div className="co-summary-row"><span>상품 금액</span><span>{subtotal.toLocaleString()}원</span></div>
              <div className="co-summary-row"><span>배송비</span><span>0원</span></div>
              {couponDiscount > 0 && (
                <div className="co-summary-row discount">
                  <span>쿠폰 할인</span><span>-{couponDiscount.toLocaleString()}원</span>
                </div>
              )}
            </div>
            <div className="co-summary-divider" />
            <div className="co-summary-total">
              <span>최종 결제 금액</span>
              <span className="co-total-price">{total.toLocaleString()}원</span>
            </div>
            {orderError && <p style={{ fontSize: 12, color: '#EF4444', marginBottom: 8 }}>{orderError}</p>}
            <button className="co-order-btn" onClick={handleOrder} disabled={!canOrder}>
              {ordering ? '주문 처리 중...' : '결제하기'}
            </button>
            <button className="co-back-btn" onClick={() => onNavigate('cart')}>장바구니로 돌아가기</button>
            <p className="co-notice">주문 내용을 확인하였으며,<br />결제에 동의합니다.</p>
          </div>
        </div>
      </div>
    </div>
  )
}