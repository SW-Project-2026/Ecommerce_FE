import "./CustomerDashboardPage.css";

const CUSTOMER = {
  id: "jj1234",
  name: "김지원",
  tier: "VIP 회원 · 가입 2023-04-22",
  lastAccess: "오늘 오전 9:14",
  lastPurchase: "14일 전",
  withdrawVisit: "없음",
};

const DONUT_STATS = [
  {
    label: "광고 노출 대비 클릭률",
    sub: "CTR",
    value: "5.1%",
    pct: 5.1,
    color: "#4F6EF7",
    trackColor: "#D7DFF0",
    legends: [
      { color: "#4F6EF7", text: "클릭 259회" },
      { color: "#D7DFF0", text: "노출 4,040회" },
    ],
  },
  {
    label: "쿠폰 수신 대비 사용률",
    sub: "",
    value: "66.7%",
    pct: 66.7,
    color: "#8CA0FA",
    trackColor: "#D7DFF0",
    legends: [
      { color: "#18B87A", text: "사용 2장" },
      { color: "#D7DFF0", text: "미사용 1장" },
    ],
  },
  {
    label: "광고 → 구매 전환율",
    sub: "",
    value: "2.94%",
    pct: 2.94,
    color: "#4F6EF7",
    trackColor: "#D7DFF0",
    legends: [
      { color: "#4F6EF7", text: "구매 20회" },
      { color: "#E3EDF4", text: "광고 668건 노출" },
    ],
  },
];

const KEYWORDS = ["축구화", "축구공", "스포츠의류", "헬스보충제"];

const TIME_BARS = [
  { label: "00-03", pct: 9,   color: "#DCE2FD" },
  { label: "03-06", pct: 7,   color: "#DCE2FD" },
  { label: "06-09", pct: 100, color: "#FF6B6B" },
  { label: "09-12", pct: 67,  color: "#8CA0FA" },
  { label: "12-15", pct: 51,  color: "#B0BDFB" },
  { label: "15-18", pct: 27,  color: "#DCE2FD" },
  { label: "18-21", pct: 46,  color: "#B0BDFB" },
  { label: "21-24", pct: 22,  color: "rgba(79,110,247,0.2)" },
];

const CART_ITEMS = [
  { name: "Nike 축구화 F30",      cat: "스포츠 · 축구용품", price: "189,000원" },
  { name: "어댑터 단백질 파우더",  cat: "헬스 · 보충제",     price: "54,000원"  },
  { name: "무릎 보호대",           cat: "스포츠 · 보호용품", price: "28,000원"  },
  { name: "스포츠 양말 (5켤레)",   cat: "스포츠 · 의류",     price: "12,000원"  },
];

const RECENT_ORDERS = [
  { name: "Nike 축구화 F30",      cat: "스포츠 · 축구용품", price: "189,000원" },
  { name: "어댑터 단백질 파우더",  cat: "헬스 · 보충제",     price: "54,000원"  },
  { name: "무릎 보호대",           cat: "스포츠 · 보호용품", price: "28,000원"  },
  { name: "스포츠 양말 (5켤레)",   cat: "스포츠 · 의류",     price: "12,000원"  },
];

const Y_LABELS = ["100", "80", "60", "40", "20", "0"];

function DonutChart({ pct, color, trackColor, value }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const gap  = circ - dash;
  return (
    <div className="cd-donut-wrap">
      <svg viewBox="0 0 140 140" width="140" height="140">
        <circle cx="70" cy="70" r={r} fill="none" stroke={trackColor} strokeWidth="16" />
        <circle
          cx="70" cy="70" r={r}
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
        />
      </svg>
      <div className="cd-donut-label">{value}</div>
    </div>
  );
}

export default function CustomerDashboardPage() {
  const initial = CUSTOMER.name[0];
  return (
    <div className="cd-main">
      {/* 페이지 헤더 */}
      <div className="cd-page-header">
        <div>
          <h1 className="cd-page-title">개인 고객 대시보드</h1>
          <p className="cd-page-sub">고객 ID: {CUSTOMER.id} · {CUSTOMER.name}</p>
        </div>
        <button className="cd-back-btn">← 고객 목록</button>
      </div>

      <div className="cd-content">

        {/* 프로필 */}
        <div className="cd-profile-card">
          <div className="cd-profile-deco" />
          <div className="cd-profile-top">
            <div className="cd-avatar">{initial}</div>
            <div className="cd-profile-info">
              <p className="cd-profile-name">{CUSTOMER.name}</p>
              <p className="cd-profile-tier">{CUSTOMER.tier}</p>
              <div className="cd-profile-badges">
                <span className="cd-badge cd-badge-vip">VIP</span>
                <span className="cd-badge cd-badge-freq">구매빈도 HIGH</span>
                <span className="cd-badge cd-badge-churn">이탈위험 낮음</span>
              </div>
            </div>
          </div>
          <div className="cd-profile-stats">
            <div className="cd-profile-stat-row">
              <span className="cd-profile-stat-label">최근 접속</span>
              <span className="cd-profile-stat-value">{CUSTOMER.lastAccess}</span>
            </div>
            <div className="cd-profile-stat-row">
              <span className="cd-profile-stat-label">최근 구매일</span>
              <span className="cd-profile-stat-value">{CUSTOMER.lastPurchase}</span>
            </div>
            <div className="cd-profile-stat-row">
              <span className="cd-profile-stat-label">탈퇴 페이지 방문</span>
              <span className="cd-profile-stat-value">{CUSTOMER.withdrawVisit}</span>
            </div>
          </div>
        </div>

        {/* 도넛 차트 3개 */}
        <div className="cd-donut-row">
          {DONUT_STATS.map((s, i) => (
            <div key={i} className="cd-donut-card">
              <div className="cd-donut-card-header">
                <span className="cd-donut-card-title">{s.label}</span>
                {s.sub && <span className="cd-donut-card-sub">{s.sub}</span>}
              </div>
              <DonutChart pct={s.pct} color={s.color} trackColor={s.trackColor} value={s.value} />
              <div className="cd-donut-legends">
                {s.legends.map((l, j) => (
                  <div key={j} className="cd-donut-legend">
                    <span className="cd-donut-legend-dot" style={{ background: l.color }} />
                    <span className="cd-donut-legend-text">{l.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 관심 키워드 + 주 접속 시간대 */}
        <div className="cd-mid-row">
          <div className="cd-card cd-keyword-card">
            <p className="cd-card-title">관심 키워드 / 카테고리</p>
            <p className="cd-card-sub">검색 및 페이지 체류 시간 기반</p>
            <div className="cd-keyword-wrap">
              {KEYWORDS.map((k, i) => (
                <span key={i} className="cd-keyword-chip">{k}</span>
              ))}
            </div>
          </div>

          <div className="cd-card cd-timeslot-card">
            <p className="cd-card-title">주 접속 시간대</p>
            <p className="cd-card-sub">최근 30일 기반</p>
            <div className="cd-chart-wrap">
              <div className="cd-chart-y">
                {Y_LABELS.map((l, i) => (
                  <span key={i} className="cd-chart-y-label">{l}</span>
                ))}
              </div>
              <div style={{ flex: 1, position: "relative", height: "100%" }}>
                <div className="cd-chart-grid">
                  {Y_LABELS.map((_, i) => (
                    <div key={i} className="cd-chart-grid-line" />
                  ))}
                </div>
                <div className="cd-chart-bars">
                  {TIME_BARS.map((b, i) => (
                    <div key={i} className="cd-bar-col">
                      <div className="cd-bar-track">
                        <div className="cd-bar-fill" style={{ height: `${b.pct}%`, background: b.color }} />
                      </div>
                      <span className="cd-bar-label">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 장바구니 + 최근 구매 이력 */}
        <div className="cd-grid-2">
          <div className="cd-card">
            <p className="cd-card-title">현재 장바구니</p>
            <div className="cd-card-divider" />
            {CART_ITEMS.map((item, i) => (
              <div key={i} className="cd-list-item">
                <div>
                  <p className="cd-list-name">{item.name}</p>
                  <p className="cd-list-cat">{item.cat}</p>
                </div>
                <span className="cd-list-price">{item.price}</span>
              </div>
            ))}
          </div>
          <div className="cd-card">
            <p className="cd-card-title">최근 구매 이력</p>
            <div className="cd-card-divider" />
            {RECENT_ORDERS.map((item, i) => (
              <div key={i} className="cd-list-item">
                <div>
                  <p className="cd-list-name">{item.name}</p>
                  <p className="cd-list-cat">{item.cat}</p>
                </div>
                <span className="cd-list-price">{item.price}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}