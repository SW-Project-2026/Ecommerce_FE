import { useState } from 'react'

const ORDERS = [
  {
    date: '2025.04.15',
    num: 'ORD-20250415-001',
    items: [
      { emoji: '💻', name: '삼성 갤럭시북4 Pro 360 16인치', meta: '실버 / 1개', price: '1,290,000원', status: 'shipping' },
    ],
  },
  {
    date: '2025.04.02',
    num: 'ORD-20250402-088',
    items: [
      { emoji: '🎧', name: '소니 WH-1000XM5 무선 헤드폰', meta: '블랙 / 1개', price: '389,000원', status: 'complete' },
      { emoji: '🔌', name: 'USB-C 고속충전 케이블 1.5m', meta: '화이트 / 2개', price: '19,800원', status: 'complete' },
    ],
  },
  {
    date: '2025.03.20',
    num: 'ORD-20250320-042',
    items: [
      { emoji: '👟', name: '나이키 에어맥스 270 리액트', meta: '270 / 270mm / 1개', price: '149,000원', status: 'complete' },
    ],
  },
  {
    date: '2025.03.10',
    num: 'ORD-20250310-011',
    items: [
      { emoji: '🧻', name: '유한킴벌리 화이트 3겹 휴지 30롤', meta: '1박스', price: '28,900원', status: 'complete' },
    ],
  },
]

const STATUS_MAP = {
  shipping: { label: '배송중',   cls: 'myp-status--shipping' },
  complete: { label: '배송완료', cls: 'myp-status--complete' },
  pending:  { label: '결제완료', cls: 'myp-status--pending'  },
  cancel:   { label: '취소/반품', cls: 'myp-status--cancel'   },
}

const FILTERS = ['전체', '1개월', '3개월', '6개월']

export default function MyOrderList() {
  const [filter, setFilter] = useState('전체')

  return (
    <div className="myp-section">
      <div className="myp-section-title">
        <i className="ri-file-list-3-line" />
        주문 내역
      </div>

      <div className="myp-order-filters">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`myp-filter-btn${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {ORDERS.map((order, oi) => (
        <div className="myp-order-card" key={oi}>
          <div className="myp-order-card-header">
            <span className="myp-order-date">{order.date}</span>
            <span className="myp-order-num">{order.num}</span>
            {/* 주문 상세 버튼이 있던 자리입니다. 깔끔하게 삭제되었습니다. */}
          </div>

          {order.items.map((item, ii) => (
            <div className="myp-order-item" key={ii}>
              <div className="myp-order-item-thumb">{item.emoji}</div>
              <div className="myp-order-item-info">
                <div className="myp-order-item-name">{item.name}</div>
                <div className="myp-order-item-meta">{item.meta}</div>
              </div>
              <span className={`myp-order-status ${STATUS_MAP[item.status].cls}`}>
                {STATUS_MAP[item.status].label}
              </span>
              <span className="myp-order-item-price">{item.price}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}