import { useState, useEffect, useRef, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import "./CustomerDashboardPage.css";
import { getCustomerDetail, getCustomerOrders, getCustomerCart, getCustomerWishlist } from "../api/dashboard";
import { getUserDetail } from "../api/users";

// 시간대 바 색상
function getTimeColor(count, max) {
  if (count === max) return "#FF6B6B";
  const ratio = count / max;
  if (ratio > 0.6) return "#8CA0FA";
  if (ratio > 0.4) return "#B0BDFB";
  return "#DCE2FD";
}

function toDateStr(d) {
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function defaultDateRange() {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 30)
  return { from: toDateStr(from), to: toDateStr(to) }
}

export default function CustomerDashboardPage({ userId, onBack }) {
  const [detail,       setDetail]       = useState(null);
  const [loginId,      setLoginId]      = useState(null);
  const [dateRange,    setDateRange]    = useState(() => defaultDateRange());
  const [orders,       setOrders]       = useState([]);
  const [cart,         setCart]         = useState([]);
  const [wishlist,     setWishlist]     = useState([]);
  const [orderCursor,  setOrderCursor]  = useState(null);
  const [cartCursor,   setCartCursor]   = useState(null);
  const [wishlistCursor, setWishlistCursor] = useState(null);
  const [orderHasNext, setOrderHasNext] = useState(false);
  const [cartHasNext,  setCartHasNext]  = useState(false);
  const [wishlistHasNext, setWishlistHasNext] = useState(false);
  const [loading,      setLoading]      = useState(true);

  const orderRef = useRef(null);
  const cartRef  = useRef(null);
  const wishlistRef = useRef(null);

  // 상세 조회
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getCustomerDetail({ userId, from: dateRange.from, to: dateRange.to })
      .then(data => setDetail(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId, dateRange]);

  // 로그인 ID 조회
  useEffect(() => {
    if (!userId) return;
    getUserDetail({ userId })
      .then(data => setLoginId(data?.loginId ?? null))
      .catch(() => {});
  }, [userId]);

  // 구매이력 초기 조회
  useEffect(() => {
    if (!userId) return;
    getCustomerOrders({ userId, size: 4 })
      .then(data => {
        setOrders(data.content ?? []);
        setOrderCursor(data.nextCursor);
        setOrderHasNext(data.hasNext);
      })
      .catch(() => {});
  }, [userId]);

  // 장바구니 초기 조회
  useEffect(() => {
    if (!userId) return;
    getCustomerCart({ userId, size: 4 })
      .then(data => {
        setCart(data.content ?? []);
        setCartCursor(data.nextCursor);
        setCartHasNext(data.hasNext);
      })
      .catch(() => {});
  }, [userId]);

  // 찜 목록 초기 조회
  useEffect(() => {
    if (!userId) return;
    getCustomerWishlist({ userId, size: 4 })
      .then(data => {
        setWishlist(data.content ?? []);
        setWishlistCursor(data.nextCursor);
        setWishlistHasNext(data.hasNext);
      })
      .catch(() => {});
  }, [userId]);

  // 구매이력 무한스크롤
  const loadMoreOrders = useCallback(() => {
    if (!orderHasNext || !orderCursor) return;
    getCustomerOrders({ userId, cursor: orderCursor, size: 4 })
      .then(data => {
        setOrders(prev => [...prev, ...(data.content ?? [])]);
        setOrderCursor(data.nextCursor);
        setOrderHasNext(data.hasNext);
      })
      .catch(() => {});
  }, [userId, orderCursor, orderHasNext]);

  // 장바구니 무한스크롤
  const loadMoreCart = useCallback(() => {
    if (!cartHasNext || !cartCursor) return;
    getCustomerCart({ userId, cursor: cartCursor, size: 4 })
      .then(data => {
        setCart(prev => [...prev, ...(data.content ?? [])]);
        setCartCursor(data.nextCursor);
        setCartHasNext(data.hasNext);
      })
      .catch(() => {});
  }, [userId, cartCursor, cartHasNext]);

  // 찜 목록 무한스크롤
  const loadMoreWishlist = useCallback(() => {
    if (!wishlistHasNext || !wishlistCursor) return;
    getCustomerWishlist({ userId, cursor: wishlistCursor, size: 4 })
      .then(data => {
        setWishlist(prev => [...prev, ...(data.content ?? [])]);
        setWishlistCursor(data.nextCursor);
        setWishlistHasNext(data.hasNext);
      })
      .catch(() => {});
  }, [userId, wishlistCursor, wishlistHasNext]);

  // 스크롤 감지
  useEffect(() => {
    const el = orderRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) loadMoreOrders();
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [loadMoreOrders]);

  useEffect(() => {
    const el = cartRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) loadMoreCart();
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [loadMoreCart]);

  useEffect(() => {
    const el = wishlistRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) loadMoreWishlist();
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [loadMoreWishlist]);

  if (loading && !detail) return (
    <div className="cd-main">
      <div style={{ padding: 40, textAlign: "center", color: "#9BAAC0", fontSize: 13 }}>불러오는 중...</div>
    </div>
  );

  const info        = detail?.customerInfo ?? {};
  const ctr         = detail?.ctr ?? {};
  const coupon      = detail?.couponUsage ?? {};
  const adConv      = detail?.adConversion ?? {};
  const keywords    = detail?.interestedCategories ?? [];
  const timeSlots   = detail?.accessTimeSlots ?? [];

  const maxCount = Math.max(...timeSlots.map(t => t.count), 1);

  // 도넛 데이터
  const ctrData    = [{ name: "클릭", value: ctr.clicks ?? 0 }, { name: "노출", value: (ctr.impressions ?? 0) - (ctr.clicks ?? 0) }];
  const couponData = [{ name: "사용", value: coupon.used ?? 0 }, { name: "미사용", value: coupon.unused ?? 0 }];
  const adData     = [{ name: "구매", value: adConv.purchases ?? 0 }, { name: "노출", value: (adConv.adImpressions ?? 0) - (adConv.purchases ?? 0) }];

  const ctrRate    = ctr.rate    != null ? `${ctr.rate.toFixed(1)}%`    : "–";
  const couponRate = coupon.rate != null ? `${coupon.rate.toFixed(1)}%` : "–";
  const adRate     = adConv.rate != null ? `${adConv.rate.toFixed(2)}%` : "–";

  const DONUT_STATS = [
    {
      label: "광고 노출 대비 클릭률", sub: "CTR", value: ctrRate,
      data: ctrData, colors: ["#4F6EF7", "#D7DFF0"],
      legends: [
        { color: "#4F6EF7", text: `클릭 ${(ctr.clicks ?? 0).toLocaleString()}회` },
        { color: "#D7DFF0", text: `노출 ${(ctr.impressions ?? 0).toLocaleString()}회` },
      ],
    },
    {
      label: "쿠폰 수신 대비 사용률", sub: "", value: couponRate,
      data: couponData, colors: ["#18B87A", "#D7DFF0"],
      legends: [
        { color: "#18B87A", text: `사용 ${coupon.used ?? 0}장` },
        { color: "#D7DFF0", text: `미사용 ${coupon.unused ?? 0}장` },
      ],
    },
    {
      label: "광고 → 구매 전환율", sub: "", value: adRate,
      data: adData, colors: ["#4F6EF7", "#E3EDF4"],
      legends: [
        { color: "#4F6EF7", text: `구매 ${adConv.purchases ?? 0}회` },
        { color: "#E3EDF4", text: `광고 ${(adConv.adImpressions ?? 0).toLocaleString()}건 노출` },
      ],
    },
  ];

  return (
    <div className="cd-main">
      <div className="cd-page-header">
        <div>
          <h1 className="cd-page-title">개인 고객 대시보드</h1>
          <p className="cd-page-sub">고객 ID: {loginId ?? userId} · {info.name ?? "–"}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div className="cd-date-range">
            <input
              type="date"
              className="cd-date-input"
              value={dateRange.from}
              max={dateRange.to}
              onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            />
            <span className="cd-date-tilde">~</span>
            <input
              type="date"
              className="cd-date-input"
              value={dateRange.to}
              min={dateRange.from}
              max={toDateStr(new Date())}
              onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            />
          </div>
          <button className="cd-back-btn" onClick={onBack}>← 고객 목록</button>
        </div>
      </div>

      <div className="cd-content">

        {/* 프로필 */}
        <div className="cd-profile-card">
          <div className="cd-profile-deco" />
          <div className="cd-profile-top">
            <div className="cd-profile-info">
              <p className="cd-profile-name">{info.name ?? "–"}</p>
              <p className="cd-profile-tier">{info.grade} · 가입 {info.joinDate ?? "–"}</p>
              <div className="cd-profile-badges">
                {info.grade && <span className="cd-badge cd-badge-grade">{info.grade}</span>}
                {info.tags?.purchaseFrequency && (
                  <span className="cd-badge cd-badge-freq">구매빈도 {info.tags.purchaseFrequency}</span>
                )}
                {info.tags?.churnRisk && (
                  <span className={`cd-badge ${info.tags.churnRisk === "HIGH" || info.tags.churnRisk === "높음" ? "cd-badge-churn-high" : "cd-badge-churn"}`}>
                    이탈위험 {info.tags.churnRisk === "HIGH" || info.tags.churnRisk === "높음" ? "높음" : "낮음"}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="cd-profile-stats">
            <div className="cd-profile-stat-row">
              <span className="cd-profile-stat-label">최근 접속</span>
              <span className="cd-profile-stat-value">{info.lastLogin || "–"}</span>
            </div>
            <div className="cd-profile-stat-row">
              <span className="cd-profile-stat-label">최근 구매일</span>
              <span className="cd-profile-stat-value">{info.lastPurchase || "–"}</span>
            </div>
            <div className="cd-profile-stat-row">
              <span className="cd-profile-stat-label">탈퇴 페이지 방문</span>
              <span className="cd-profile-stat-value">{info.churnPageVisited ? "있음" : "없음"}</span>
            </div>
          </div>
        </div>

        {/* 도넛 3개 */}
        <div className="cd-donut-row">
          {DONUT_STATS.map((s, i) => (
            <div key={i} className="cd-donut-card">
              <div className="cd-donut-card-header">
                <span className="cd-donut-card-title">{s.label}</span>
                {s.sub && <span className="cd-donut-card-sub">{s.sub}</span>}
              </div>
              <div className="cd-donut-body">
                <div className="cd-donut-legends">
                  {s.legends.map((l, j) => (
                    <div key={j} className="cd-donut-legend">
                      <span className="cd-donut-legend-dot" style={{ background: l.color }} />
                      <span className="cd-donut-legend-text">{l.text}</span>
                    </div>
                  ))}
                </div>
                <div style={{ position: 'relative', width: 140, height: 140 }}>
                  <PieChart width={140} height={140}>
                    <Pie
                      data={s.data}
                      cx={70} cy={70} innerRadius={42} outerRadius={60}
                      startAngle={90} endAngle={-270}
                      dataKey="value" strokeWidth={0}
                    >
                      {s.colors.map((c, k) => <Cell key={k} fill={c} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v.toLocaleString()}`, n]} />
                  </PieChart>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none', transform: 'translate(6px, 2px)',
                    fontFamily: "'DM Sans','Inter',sans-serif", fontWeight: 700, fontSize: 18, color: '#212023',
                  }}>
                    {s.value}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 관심 키워드 + 주 접속 시간대 */}
        <div className="cd-mid-row">
          <div className="cd-card cd-keyword-card">
            <p className="cd-card-title">관심 키워드 / 카테고리</p>
            <p className="cd-card-sub">사용자 검색 기반</p>
            <div className="cd-keyword-wrap">
              {keywords.length > 0
                ? keywords.map((k, i) => <span key={i} className="cd-keyword-chip">{k}</span>)
                : <span style={{ fontSize: 12, color: "#9BAAC0" }}>데이터 없음</span>}
            </div>
          </div>

          <div className="cd-card cd-timeslot-card">
            <p className="cd-card-title">주 접속 시간대</p>
            <p className="cd-card-sub">선택 기간 기준</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={timeSlots.map(t => ({ ...t, fill: getTimeColor(t.count, maxCount) }))}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E8F4" vertical={false} />
                <XAxis dataKey="timeSlot" tick={{ fontSize: 9, fill: "#9BAAC0" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#9BAAC0" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {timeSlots.map((t, i) => (
                    <Cell key={i} fill={getTimeColor(t.count, maxCount)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 찜 목록 + 장바구니 + 최근 구매 이력 */}
        <div className="cd-grid-3">
          <div className="cd-card">
            <p className="cd-card-title">현재 찜 목록</p>
            <div className="cd-card-divider" />
            <div ref={wishlistRef} className="cd-scroll-list">
              {wishlist.length === 0
                ? <p style={{ fontSize: 12, color: "#9BAAC0", textAlign: "center", padding: 16 }}>데이터 없음</p>
                : wishlist.map((item, i) => (
                  <div key={i} className="cd-list-item">
                    <div>
                      <p className="cd-list-name">{item.productName}</p>
                      <p className="cd-list-cat">{item.category}</p>
                    </div>
                    <span className="cd-list-price">{item.price?.toLocaleString()}원</span>
                  </div>
                ))}
            </div>
          </div>
          <div className="cd-card">
            <p className="cd-card-title">현재 장바구니</p>
            <div className="cd-card-divider" />
            <div ref={cartRef} className="cd-scroll-list">
              {cart.length === 0
                ? <p style={{ fontSize: 12, color: "#9BAAC0", textAlign: "center", padding: 16 }}>데이터 없음</p>
                : cart.map((item, i) => (
                  <div key={i} className="cd-list-item">
                    <div>
                      <p className="cd-list-name">{item.productName}</p>
                      <p className="cd-list-cat">{item.category}</p>
                    </div>
                    <span className="cd-list-price">{item.price?.toLocaleString()}원</span>
                  </div>
                ))}
            </div>
          </div>
          <div className="cd-card">
            <p className="cd-card-title">최근 구매 이력</p>
            <div className="cd-card-divider" />
            <div ref={orderRef} className="cd-scroll-list">
              {orders.length === 0
                ? <p style={{ fontSize: 12, color: "#9BAAC0", textAlign: "center", padding: 16 }}>데이터 없음</p>
                : orders.map((item, i) => (
                  <div key={i} className="cd-list-item">
                    <div>
                      <p className="cd-list-name">{item.productName}</p>
                      <p className="cd-list-cat">{item.category}</p>
                    </div>
                    <span className="cd-list-price">{item.price?.toLocaleString()}원</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}