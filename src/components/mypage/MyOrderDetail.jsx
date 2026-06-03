import { useState, useEffect } from 'react'
import { orderDetail, orderCancel } from '../../api/orders'

const STATUS_MAP = {
  PENDING:   { label: '결제완료', cls: 'myp-status--pending',  canCancel: true  },
  CONFIRMED: { label: '결제완료', cls: 'myp-status--pending',  canCancel: true  },
  SHIPPING:  { label: '배송중',   cls: 'myp-status--shipping', canCancel: true  },
  DELIVERED: { label: '배송완료', cls: 'myp-status--complete', canCancel: false },
  CANCELLED: { label: '취소/반품', cls: 'myp-status--cancel',  canCancel: false },
}

export default function MyOrderDetail({ orderId, onBack }) {
  const [order,      setOrder]      = useState(null)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState(null)
  const [cancelled,  setCancelled]  = useState(false)

  useEffect(() => {
    if (!orderId) return
    fetchDetail()
  }, [orderId])

  async function fetchDetail() {
    setLoading(true)
    setError(null)
    try {
      const data = await orderDetail({ orderId })
      setOrder(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel() {
    if (!window.confirm('주문을 취소하시겠습니까?')) return
    setCancelling(true)
    setCancelError(null)
    try {
      await orderCancel({ orderId })
      setCancelled(true)
      fetchDetail()
    } catch (err) {
      setCancelError(err.message)
    } finally {
      setCancelling(false)
    }
  }

  const statusInfo = order ? (STATUS_MAP[order.status] ?? { label: order.status, cls: '', canCancel: false }) : null

  return (
    <div className="myp-section">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#374151', padding: 0 }}>
          <i className="ri-arrow-left-line" />
        </button>
        <div className="myp-section-title" style={{ margin: 0 }}>
          <i className="ri-file-list-3-line" />
          주문 상세
        </div>
      </div>

      {loading && <div style={{ fontSize: 13, color: '#9EA6B4', padding: '24px 0', textAlign: 'center' }}>불러오는 중...</div>}
      {error   && <div style={{ fontSize: 13, color: '#EF4444', padding: '8px 0' }}>{error}</div>}

      {order && (
        <>
          <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>주문번호</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{order.orderId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>주문일시</span>
              <span style={{ fontSize: 13, color: '#374151' }}>{order.orderDate?.substring(0, 10).replaceAll('-', '.')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>주문상태</span>
              <span className={`myp-order-status ${statusInfo.cls}`}>{statusInfo.label}</span>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>주문 상품 ({(order.items ?? []).length}개)</div>
            {(order.items ?? []).map(item => (
              <div className="myp-order-item" key={item.orderItemId} style={{ marginBottom: 12 }}>
                <div className="myp-order-item-thumb">
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                    : <div style={{ width: '100%', height: '100%', background: '#F0F0F0', borderRadius: 4 }} />}
                </div>
                <div className="myp-order-item-info">
                  <div className="myp-order-item-name">{item.productName}</div>
                  <div className="myp-order-item-meta">{item.quantity}개 · {item.unitPrice?.toLocaleString()}원</div>
                </div>
                <span className="myp-order-item-price">{item.subtotal?.toLocaleString()}원</span>
              </div>
            ))}
          </div>

          {order.address && (
            <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>배송지</div>
              <div style={{ fontSize: 13, color: '#374151' }}>{order.address.roadNameAddress}</div>
              {order.address.addressDetail && (
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{order.address.addressDetail}</div>
              )}
            </div>
          )}

          <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>결제 금액</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>상품 금액</span>
              <span style={{ fontSize: 13, color: '#374151' }}>{order.totalAmount?.toLocaleString()}원</span>
            </div>
            {order.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>쿠폰 할인</span>
                <span style={{ fontSize: 13, color: '#EF4444' }}>-{order.discountAmount?.toLocaleString()}원</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>배송비</span>
              <span style={{ fontSize: 13, color: '#374151' }}>0원</span>
            </div>
            <div style={{ borderTop: '1px solid #E5E7EB', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>최종 결제금액</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1C2E5C' }}>{order.finalAmount?.toLocaleString()}원</span>
            </div>
          </div>

          {statusInfo.canCancel && !cancelled && (
            <div>
              {cancelError && <div style={{ fontSize: 12, color: '#EF4444', marginBottom: 8 }}>{cancelError}</div>}
              <button
                onClick={handleCancel}
                disabled={cancelling}
                style={{
                  width: '100%', height: 44, border: '1px solid #EF4444', borderRadius: 10,
                  fontSize: 14, fontWeight: 600, color: '#EF4444', background: '#fff', cursor: 'pointer'
                }}
              >
                {cancelling ? '취소 처리 중...' : '주문 취소'}
              </button>
            </div>
          )}
          {cancelled && (
            <div style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', padding: '8px 0' }}>주문이 취소되었습니다.</div>
          )}
        </>
      )}
    </div>
  )
}