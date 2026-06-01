import { useState, useEffect } from 'react'
import { orderList } from '../../api/orders'

const STATUS_MAP = {
  PENDING:   { label: '결제완료', cls: 'myp-status--pending'  },
  CONFIRMED: { label: '결제완료', cls: 'myp-status--pending'  },
  SHIPPING:  { label: '배송중',   cls: 'myp-status--shipping' },
  DELIVERED: { label: '배송완료', cls: 'myp-status--complete' },
  CANCELLED: { label: '취소/반품', cls: 'myp-status--cancel'  },
}

const FILTER_PERIOD_MAP = {
  '전체':  'all',
  '1개월': '1m',
  '3개월': '3m',
  '6개월': '6m',
}

const FILTERS = ['전체', '1개월', '3개월', '6개월']

export default function MyOrderList({ onNavigate }) {
  const [filter,  setFilter]  = useState('전체')
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [cursor,  setCursor]  = useState(null)
  const [hasNext, setHasNext] = useState(false)

  useEffect(() => {
    fetchOrders(null, filter)
  }, [filter])

  async function fetchOrders(nextCursor = null, currentFilter = filter) {
    setLoading(true)
    setError(null)
    try {
      const period = FILTER_PERIOD_MAP[currentFilter] ?? 'all'
      const data = await orderList({ cursor: nextCursor, period, size: 10 })
      const content = data.content ?? []
      setOrders(prev => nextCursor ? [...prev, ...content] : content)
      setCursor(data.nextCursor ?? null)
      setHasNext(data.hasNext ?? false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleFilterChange(f) {
    setFilter(f)
    setOrders([])
    setCursor(null)
  }

  return (
    <div className="myp-section">
      <div className="myp-section-title">
        <i className="ri-file-list-3-line" />
        주문 내역
      </div>

      <div className="myp-order-filters">
        {FILTERS.map(f => (
          <button key={f} className={`myp-filter-btn${filter === f ? ' active' : ''}`} onClick={() => handleFilterChange(f)}>
            {f}
          </button>
        ))}
      </div>

      {loading && orders.length === 0 && (
        <div style={{ fontSize: 13, color: '#9EA6B4', padding: '24px 0', textAlign: 'center' }}>불러오는 중...</div>
      )}
      {error && <div style={{ fontSize: 13, color: '#EF4444', padding: '8px 0' }}>{error}</div>}
      {!loading && !error && orders.length === 0 && (
        <div style={{ fontSize: 13, color: '#9EA6B4', padding: '24px 0', textAlign: 'center' }}>주문 내역이 없어요.</div>
      )}

      {orders.map(order => {
        const statusInfo = STATUS_MAP[order.status] ?? { label: order.status, cls: '' }
        return (
          <div
            className="myp-order-card"
            key={order.orderId}
            onClick={() => onNavigate('order-detail', order.orderId)}
            style={{ cursor: 'pointer' }}
          >
            <div className="myp-order-card-header">
              <span className="myp-order-date">{order.orderDate?.substring(0, 10).replaceAll('-', '.')}</span>
              <span className="myp-order-num">{order.orderId}</span>
              <span style={{ fontSize: 12, color: '#6B7280', marginLeft: 'auto' }}>상세보기 &gt;</span>
            </div>

            {(order.items ?? []).map(item => (
              <div className="myp-order-item" key={item.orderItemId}>
                <div className="myp-order-item-thumb">
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                    : <div style={{ width: '100%', height: '100%', background: '#F0F0F0', borderRadius: 4 }} />}
                </div>
                <div className="myp-order-item-info">
                  <div className="myp-order-item-name">{item.productName}</div>
                  <div className="myp-order-item-meta">{item.quantity}개 · {item.unitPrice?.toLocaleString()}원</div>
                </div>
                <span className={`myp-order-status ${statusInfo.cls}`}>{statusInfo.label}</span>
                <span className="myp-order-item-price">{item.subtotal?.toLocaleString()}원</span>
              </div>
            ))}
          </div>
        )
      })}

      {hasNext && (
        <button onClick={() => fetchOrders(cursor)} disabled={loading}
          style={{ marginTop: 16, width: '100%', height: 40, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer', background: '#fff' }}>
          {loading ? '불러오는 중...' : '더보기'}
        </button>
      )}
    </div>
  )
}