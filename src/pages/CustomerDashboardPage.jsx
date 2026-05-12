import "./CustomerDashboardPage.css";

const CUSTOMER = {
  id: "USER-290411",
  name: "김지원",
  tier: "VIP 회원",
  joinYear: "가입 3년차",
  lastAccess: "오늘 오전 9:14",
  tags: [
    { label: "구매빈도 HIGH", color: "#22C55E", bg: "rgba(34,197,94,0.2)" },
    { label: "쿠폰 미사용",   color: "#FF6B6B", bg: "rgba(255,107,107,0.2)" },
    { label: "이탈위험 낮음", color: "#2ABFBF", bg: "rgba(42,191,191,0.2)" },
  ],
};

const PERSONAL_STATS = [
  { label: "맞춤 광고 노출수",   value: "12,847", sub: "+8.3%",    color: "#4F6EF7" },
  { label: "광고 클릭률 (CTR)", value: "5.21%",  sub: "+1.2%",    color: "#2ABFBF" },
  { label: "발송 쿠폰 수",      value: "7",      sub: "이번달",   color: "#FF6B6B" },
  { label: "쿠폰 사용률",       value: "71.4%",  sub: "5/7 사용", color: "#FF6B6B" },
];

const KEYWORDS = [
  { text: "축구화",    size: 22, color: "#4F6EF7" },
  { text: "축구공",    size: 18, color: "#FF6B6B" },
  { text: "런닝화",    size: 16, color: "#2ABFBF" },
  { text: "스포츠의류", size: 14, color: "#22C55E" },
  { text: "헬스보충제", size: 13, color: "#FF6B6B" },
  { text: "텀블러",    size: 12, color: "#8892AA" },
  { text: "마스크",    size: 12, color: "#8892AA" },
  { text: "운동장갑",  size: 11, color: "#4B5468" },
];

const TIME_BARS = [
  { time: "07-09", label: "출근", pct: 75, color: "rgba(42,191,191,0.9)", highlight: true },
  { time: "12-14", label: "점심", pct: 53, color: "rgba(79,110,247,0.4)",  highlight: false },
  { time: "19-22", label: "저녁", pct: 35, color: "rgba(79,110,247,0.4)",  highlight: false },
  { time: "주말",  label: "주말", pct: 26, color: "rgba(79,110,247,0.4)",  highlight: false },
];

const SATISFACTION = [
  { label: "리뷰 평점",        value: "4.2/5",   status: "정상", statusColor: "#22C55E", statusBg: "rgba(34,197,94,0.2)",   valueColor: "#F0F2FF" },
  { label: "접속 빈도",        value: "월 18회", status: "정상", statusColor: "#22C55E", statusBg: "rgba(34,197,94,0.2)",   valueColor: "#F0F2FF" },
  { label: "최근 구매일",      value: "14일 전", status: "주의", statusColor: "#FF6B6B", statusBg: "rgba(255,107,107,0.2)", valueColor: "#FF6B6B" },
  { label: "탈퇴 페이지 방문", value: "없음",    status: "정상", statusColor: "#22C55E", statusBg: "rgba(34,197,94,0.2)",   valueColor: "#F0F2FF" },
];

const REPURCHASE_ITEMS = [
  { name: "휴지",     cycle: "30일 주기", dayAgo: "26일 전", pct: 87, color: "rgba(239,68,68,0.9)",  alert: true  },
  { name: "영양제",   cycle: "45일 주기", dayAgo: "20일 전", pct: 44, color: "rgba(42,191,191,0.7)", alert: false },
  { name: "칫솔",     cycle: "60일 주기", dayAgo: "55일 전", pct: 92, color: "rgba(239,68,68,0.9)",  alert: true  },
  { name: "세탁세제", cycle: "40일 주기", dayAgo: "10일 전", pct: 25, color: "rgba(42,191,191,0.7)", alert: false },
];

const CART_ITEMS = [
  { name: "Nike 축구화 F30",     stock: "재고 3개 남음 ⚠", alert: true  },
  { name: "어댑터 단백질 파우더", stock: "재고 12개",        alert: false },
  { name: "무릎 보호대",          stock: "재고 2개 남음 ⚠", alert: true  },
  { name: "스포츠 양말 (5켤레)",  stock: "재고 20개",        alert: false },
];

const ACTIVE_CAMPAIGNS = [
  { name: "출근시간 맞춤광고",  desc: "축구화 · 텀블러 · 마스크",   status: "활성", statusColor: "#2ABFBF", statusBg: "rgba(42,191,191,0.2)",  barColor: "#2ABFBF" },
  { name: "심사숙고 쿠폰 발송", desc: "30분 유효 쿠폰 대기중",      status: "대기", statusColor: "#FF6B6B", statusBg: "rgba(255,107,107,0.2)", barColor: "#FF6B6B" },
  { name: "재구매 주기 광고",   desc: "휴지 · 칫솔 광고 예약됨",    status: "예약", statusColor: "#FF6B6B", statusBg: "rgba(255,107,107,0.2)", barColor: "#FF6B6B" },
  { name: "재고임박 알림",      desc: "축구화·무릎보호대 알림 발송", status: "완료", statusColor: "#22C55E", statusBg: "rgba(34,197,94,0.2)",   barColor: "#22C55E" },
];

export default function CustomerDashboardPage() {
  const initial = CUSTOMER.name[0];

  return (
    <div className="cd-main">
      <div className="cd-page-header">
        <div>
          <h1 className="cd-page-title">개인 고객 대시보드</h1>
          <p className="cd-page-sub">고객 ID: #{CUSTOMER.id} · {CUSTOMER.name}</p>
        </div>
      </div>

      <div className="cd-content">

        {/* ── 고객 프로필 카드 ── */}
        <div className="cd-profile-card">
          <div className="cd-avatar">{initial}</div>
          <div className="cd-profile-info">
            <p className="cd-profile-name">{CUSTOMER.name}</p>
            <p className="cd-profile-tier">{CUSTOMER.tier} · {CUSTOMER.joinYear}</p>
            <p className="cd-profile-access">최근 접속: {CUSTOMER.lastAccess}</p>
          </div>
          <div className="cd-profile-tags">
            {CUSTOMER.tags.map((t, i) => (
              <span key={i} className="cd-tag" style={{ color: t.color, background: t.bg }}>
                {t.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── 캠페인 성과 (개인) ── */}
        <div className="cd-section-label">캠페인 성과 (개인)</div>
        <div className="cd-stat-row">
          {PERSONAL_STATS.map((s, i) => (
            <div key={i} className="cd-stat-card">
              <div className="cd-stat-bar" style={{ background: s.color }} />
              <p className="cd-stat-label">{s.label}</p>
              <p className="cd-stat-value">{s.value}</p>
              <p className="cd-stat-sub">{s.sub}</p>
              <span className="cd-stat-tag">개인</span>
            </div>
          ))}
        </div>

        {/* ── 분석 카드 2열 ── */}
        <div className="cd-grid-2">

          {/* 관심 키워드 */}
          <div className="cd-card" style={{ "--bar": "#4F6EF7" }}>
            <p className="cd-card-title">관심 키워드</p>
            <p className="cd-card-sub">맞춤형 광고 타겟팅 기반</p>
            <div className="cd-keyword-cloud">
              {KEYWORDS.map((k, i) => (
                <span key={i} className="cd-keyword" style={{ fontSize: k.size, color: k.color }}>
                  {k.text}
                </span>
              ))}
            </div>
          </div>

          {/* 주 접속 시간대 */}
          <div className="cd-card" style={{ "--bar": "#2ABFBF" }}>
            <p className="cd-card-title">주 접속 시간대 · 요일</p>
            <p className="cd-card-sub">시간대별 광고 전략 타겟팅 기반</p>
            <div className="cd-time-chart">
              {TIME_BARS.map((b, i) => (
                <div key={i} className="cd-time-col">
                  <div className="cd-time-track">
                    <div className="cd-time-bar" style={{ height: `${b.pct}%`, background: b.color }} />
                  </div>
                  <span className="cd-time-label">{b.time}</span>
                  <span className="cd-time-sub" style={{ color: b.highlight ? "#2ABFBF" : "#4B5468" }}>
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="cd-card-note" style={{ color: "#2ABFBF" }}>
              ▲ 주 접속 피크: 출근 시간대 (07-09시)
            </p>
          </div>

          {/* 고객 만족도 */}
          <div className="cd-card" style={{ "--bar": "#22C55E" }}>
            <p className="cd-card-title">고객 만족도</p>
            <p className="cd-card-sub">이탈 방지 쿠폰 발송 기준</p>
            <div className="cd-satisfaction">
              <div className="cd-score-circle">
                <span className="cd-score-num">4.2</span>
                <span className="cd-score-denom">/5.0</span>
              </div>
              <div className="cd-satisfaction-rows">
                {SATISFACTION.map((s, i) => (
                  <div key={i} className="cd-satisfaction-row">
                    <span className="cd-sat-label">{s.label}</span>
                    <span className="cd-sat-value" style={{ color: s.valueColor }}>{s.value}</span>
                    <span className="cd-sat-status" style={{ color: s.statusColor, background: s.statusBg }}>
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 상품 재구매 주기 */}
          <div className="cd-card" style={{ "--bar": "#FF6B6B" }}>
            <p className="cd-card-title">상품 재구매 주기</p>
            <p className="cd-card-sub">소모품 광고 타이밍 기반</p>
            <div className="cd-repurchase-list">
              {REPURCHASE_ITEMS.map((r, i) => (
                <div key={i} className="cd-repurchase-row">
                  <span className="cd-repurchase-name" style={{ color: r.alert ? "#EF4444" : "#F0F2FF" }}>
                    {r.name}
                  </span>
                  <div className="cd-repurchase-bar-wrap">
                    <div className="cd-repurchase-track">
                      <div className="cd-repurchase-fill" style={{ width: `${r.pct}%`, background: r.color }} />
                    </div>
                  </div>
                  <span className="cd-repurchase-info">{r.cycle} · {r.dayAgo}</span>
                  {r.alert && <span className="cd-repurchase-alert">!</span>}
                </div>
              ))}
            </div>
            <p className="cd-card-note" style={{ color: "#EF4444" }}>
              → 휴지, 칫솔 광고 노출 권장
            </p>
          </div>

          {/* 현재 장바구니 상품 */}
          <div className="cd-card" style={{ "--bar": "#4F6EF7" }}>
            <p className="cd-card-title">현재 장바구니 상품</p>
            <p className="cd-card-sub">재고 임박 알림 기반</p>
            <div className="cd-cart-list">
              {CART_ITEMS.map((c, i) => (
                <div key={i} className={`cd-cart-row ${c.alert ? "cd-cart-alert" : ""}`}>
                  <div className="cd-cart-bar" style={{ background: c.alert ? "#EF4444" : "#252A38" }} />
                  <span className="cd-cart-name" style={{ color: c.alert ? "#F0F2FF" : "#8892AA" }}>
                    {c.name}
                  </span>
                  <span className="cd-cart-stock" style={{ color: c.alert ? "#EF4444" : "#4B5468" }}>
                    {c.stock}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── 현재 활성 타겟팅 캠페인 ── */}
        <div className="cd-campaign-card">
          <div className="cd-campaign-bar" />
          <p className="cd-card-title">현재 활성 타겟팅 캠페인</p>
          <div className="cd-campaign-list">
            {ACTIVE_CAMPAIGNS.map((c, i) => (
              <div key={i} className="cd-campaign-item">
                <div className="cd-campaign-left-bar" style={{ background: c.barColor }} />
                <div className="cd-campaign-info">
                  <p className="cd-campaign-name">{c.name}</p>
                  <p className="cd-campaign-desc">{c.desc}</p>
                </div>
                <span className="cd-campaign-status" style={{ color: c.statusColor, background: c.statusBg }}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}