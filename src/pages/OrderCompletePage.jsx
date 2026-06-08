import { usePageView } from '../hooks/usePageView'

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
                {done || active ? <i className="ri-check-line" /> : num}
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

export default function OrderCompletePage({ orderInfo, onNavigate, userId = null }) {
  usePageView('주문완료', userId)

  const now = new Date()
  const dateStr = now.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
  })
  const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  const total    = orderInfo?.total    ?? 0
  const orderId  = orderInfo?.orderId  ?? null
  const payMethod = orderInfo?.payMethod ?? '카카오페이'

  return (
    <div className="checkout-page">
      <ProgressBar step={3} />

      <div className="oc-wrap">
        <div className="oc-icon-wrap">
          <span className="oc-icon">🎉</span>
        </div>
        <h2 className="oc-title">주문이 완료되었습니다!</h2>
        <p className="oc-subtitle">주문해주셔서 감사합니다.<br />빠르게 배송해드릴게요!</p>

        <div className="oc-info-box">
          <h4 className="oc-info-title">주문 정보</h4>
          <div className="oc-info-rows">
            <div className="oc-info-row">
              <span className="oc-info-label">주문 번호</span>
              <span className="oc-info-value">{orderId ?? '–'}</span>
            </div>
            <div className="oc-info-row">
              <span className="oc-info-label">주문 일시</span>
              <span className="oc-info-value">{dateStr} {timeStr}</span>
            </div>
            <div className="oc-info-row">
              <span className="oc-info-label">결제 방법</span>
              <span className="oc-info-value">{payMethod}</span>
            </div>
            <div className="oc-info-row">
              <span className="oc-info-label">결제 금액</span>
              <span className="oc-info-value">{total.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        <div className="oc-btns">
          <button className="oc-btn-outline" onClick={() => onNavigate('home')}>계속 쇼핑하기</button>
          <button className="oc-btn-primary" onClick={() => onNavigate('mypage', 'orders')}>주문 내역 확인</button>
        </div>
      </div>
    </div>
  )
}