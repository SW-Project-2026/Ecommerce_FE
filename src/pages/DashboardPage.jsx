import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip,
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from "recharts";
import "./DashboardPage.css";
import { getDashboardSummary, getMonthlyStats, getCustomerList } from "../api/dashboard";

const FILTERS = ["전체", "VIP", "이탈위험 높음", "이탈위험 낮음", "신규"];

const FILTER_API_MAP = {
  "전체": undefined,
  "VIP": "VIP",
  "이탈위험 높음": "이탈위험높음",
  "이탈위험 낮음": "이탈위험낮음",
  "신규": "신규",
};

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

const PAGINATION_WINDOW = 3;

export default function DashboardPage({ onNavigateToCustomer }) {
  const [summary,      setSummary]      = useState(null);
  const [monthlyData,  setMonthlyData]  = useState([]);
  const [customers,    setCustomers]    = useState([]);
  const [pagination,   setPagination]   = useState({ currentPage: 1, totalPages: 1 });
  const [search,       setSearch]       = useState("");
  const [activeFilter, setActiveFilter] = useState("전체");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [dateRange,    setDateRange]    = useState(() => defaultDateRange());
  const [draftDateRange, setDraftDateRange] = useState(() => defaultDateRange());

  useEffect(() => {
    setLoading(true);
    Promise.all([getDashboardSummary({ from: dateRange.from, to: dateRange.to }), getMonthlyStats()])
      .then(([sum, monthly]) => {
        setSummary(sum);
        setMonthlyData(
          (monthly.monthlyStats ?? []).map(d => ({
            month:     d.month,
            join:      d.newCustomers,
            churnRate: d.churnRate,
          }))
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [dateRange]);

  useEffect(() => {
    const filter = FILTER_API_MAP[activeFilter];
    getCustomerList({ page: currentPage - 1, size: 10, search: search || undefined, filter, from: dateRange.from, to: dateRange.to })
      .then(data => {
        setCustomers(data.customers ?? []);
        setPagination({
          currentPage: data.pagination?.currentPage ?? 1,
          totalPages:  data.pagination?.totalPages  ?? 1,
        });
      })
      .catch(() => {});
  }, [search, activeFilter, currentPage, dateRange]);

  const ctrData = summary ? [
    { name: "클릭",   value: summary.ctr?.clicks ?? 0 },
    { name: "노출",   value: (summary.ctr?.impressions ?? 0) - (summary.ctr?.clicks ?? 0) },
  ] : [];
  const ctrRate = summary ? `${(summary.ctr?.rate ?? 0).toFixed(1)}%` : "–";

  const couponData = summary ? [
    { name: "사용",   value: summary.couponUsage?.used ?? 0 },
    { name: "미사용", value: (summary.couponUsage?.sent ?? 0) - (summary.couponUsage?.used ?? 0) },
  ] : [];
  const couponRate = summary ? `${(summary.couponUsage?.rate ?? 0).toFixed(1)}%` : "–";

  const maxJoin = Math.max(...monthlyData.map(d => d.join), 1);
  const renderBar = (props) => {
    const { x, y, width, height, value } = props;
    return <rect x={x} y={y} width={width} height={height} fill={value === maxJoin ? "#3B477B" : "rgba(82,97,164,0.38)"} rx={3} />;
  };

  const totalPages = pagination.totalPages;
  const windowStart = Math.max(1, Math.min(currentPage - 1, totalPages - PAGINATION_WINDOW + 1));
  const windowEnd   = Math.min(totalPages, windowStart + PAGINATION_WINDOW - 1);
  const pageNumbers = Array.from({ length: Math.max(0, windowEnd - windowStart + 1) }, (_, i) => windowStart + i);

  return (
    <div className="db-main">
      <div className="db-page-header">
        <h1 className="db-page-title">전체 고객 대시보드</h1>
        {summary && (
          <span className="db-total-customers">총 고객 수 {summary.totalCustomers?.toLocaleString()}명</span>
        )}
        <div className="db-date-range">
          <input
            type="date"
            className="db-date-input"
            value={draftDateRange.from}
            max={draftDateRange.to}
            onChange={e => setDraftDateRange(prev => ({ ...prev, from: e.target.value }))}
          />
          <span className="db-date-tilde">~</span>
          <input
            type="date"
            className="db-date-input"
            value={draftDateRange.to}
            min={draftDateRange.from}
            max={toDateStr(new Date())}
            onChange={e => setDraftDateRange(prev => ({ ...prev, to: e.target.value }))}
          />
          <button
            className="db-date-apply-btn"
            onClick={() => setDateRange(draftDateRange)}
            disabled={draftDateRange.from === dateRange.from && draftDateRange.to === dateRange.to}
          >
            적용
          </button>
        </div>
      </div>

      <div className="db-content">

        {/* 도넛 2개 */}
        <div className="db-donut-row">
          {/* CTR */}
          <div className="db-donut-card">
            <div className="db-donut-card-header">
              <span className="db-donut-card-title">광고 노출 대비 클릭률</span>
              <span className="db-donut-card-sub">CTR</span>
            </div>
            <div className="db-donut-body">
              <div style={{ position: 'relative', width: 210, height: 210 }}>
                <PieChart width={210} height={210}>
                  <Pie
                    data={ctrData.length ? ctrData : [{ name: "없음", value: 1 }]}
                    cx={105} cy={105} innerRadius={65} outerRadius={90}
                    startAngle={90} endAngle={-270}
                    dataKey="value" strokeWidth={0}
                  >
                    <Cell fill="#4F6EF7" />
                    <Cell fill="#D7DFF0" />
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v.toLocaleString()}회`, n]} />
                </PieChart>
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none', transform: 'translate(6px, 2px)',
                  fontFamily: "'DM Sans','Inter',sans-serif", fontWeight: 700, fontSize: 22, color: '#212023',
                }}>
                  {ctrRate}
                </div>
              </div>
              <div className="db-donut-legends">
                <div className="db-donut-legend">
                  <span className="db-donut-legend-dot" style={{ background: "#4F6EF7" }} />
                  <span className="db-donut-legend-text">클릭 {summary?.ctr?.clicks?.toLocaleString() ?? "–"}회</span>
                </div>
                <div className="db-donut-legend">
                  <span className="db-donut-legend-dot" style={{ background: "#D7DFF0" }} />
                  <span className="db-donut-legend-text">노출 {summary?.ctr?.impressions?.toLocaleString() ?? "–"}회</span>
                </div>
              </div>
            </div>
          </div>

          {/* 쿠폰 사용률 */}
          <div className="db-donut-card">
            <div className="db-donut-card-header">
              <span className="db-donut-card-title">쿠폰 사용률</span>
            </div>
            <div className="db-donut-body">
              <div style={{ position: 'relative', width: 210, height: 210 }}>
                <PieChart width={210} height={210}>
                  <Pie
                    data={couponData.length ? couponData : [{ name: "없음", value: 1 }]}
                    cx={105} cy={105} innerRadius={65} outerRadius={90}
                    startAngle={90} endAngle={-270}
                    dataKey="value" strokeWidth={0}
                  >
                    <Cell fill="#3F6B90" />
                    <Cell fill="#D7DFF0" />
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v.toLocaleString()}회`, n]} />
                </PieChart>
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none', transform: 'translate(6px, 2px)',
                  fontFamily: "'DM Sans','Inter',sans-serif", fontWeight: 700, fontSize: 22, color: '#212023',
                }}>
                  {couponRate}
                </div>
              </div>
              <div className="db-donut-legends">
                <div className="db-donut-legend">
                  <span className="db-donut-legend-dot" style={{ background: "#3F6B90" }} />
                  <span className="db-donut-legend-text">사용 {summary?.couponUsage?.used?.toLocaleString() ?? "–"}회</span>
                </div>
                <div className="db-donut-legend">
                  <span className="db-donut-legend-dot" style={{ background: "#D7DFF0" }} />
                  <span className="db-donut-legend-text">발송 {summary?.couponUsage?.sent?.toLocaleString() ?? "–"}회</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 월별 차트 */}
        <div className="db-monthly-chart">
          <div className="db-monthly-header">
            <span className="db-monthly-title">월별 신규 가입 · 탈퇴율</span>
            <span className="db-monthly-sub">최근 12개월 기준</span>
            <div className="db-monthly-legend">
              <span className="db-legend-bar" />
              <span className="db-legend-text">신규 가입자</span>
              <svg width="20" height="8" style={{ margin: "0 4px" }}>
                <line x1="0" y1="4" x2="14" y2="4" stroke="#D84E2D" strokeWidth="2" />
                <circle cx="7" cy="4" r="3" fill="#fff" stroke="#D84E2D" strokeWidth="2" />
              </svg>
              <span className="db-legend-text">탈퇴율</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={monthlyData} margin={{ top: 10, right: 40, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0DE" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#888880" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left"  orientation="left"  tick={{ fontSize: 10, fill: "#3B477B" }} axisLine={false} tickLine={false} label={{ value: "신규 가입 (명)", angle: -90, position: "insideLeft", fontSize: 10, fill: "#3B477B" }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10, fill: "#D84E2D" }} axisLine={false} tickLine={false} label={{ value: "탈퇴율 (%)", angle: 90, position: "insideRight", fontSize: 10, fill: "#D84E2D" }} />
              <Tooltip />
              <Bar yAxisId="left" dataKey="join" name="신규 가입자" shape={renderBar} />
              <Line yAxisId="right" dataKey="churnRate" name="탈퇴율" stroke="#D84E2D" strokeWidth={2} dot={{ fill: "#fff", stroke: "#D84E2D", strokeWidth: 2, r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 고객 목록 */}
        <div className="db-table-section">
          <div className="db-filter-bar">
            <div className="db-search-box">
              <input
                className="db-search-input"
                placeholder="고객명 검색..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              />
              <svg className="db-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9BAAC0" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <div className="db-filter-tabs">
              {FILTERS.map(f => (
                <button
                  key={f}
                  className={`db-filter-tab ${activeFilter === f ? "db-filter-tab-active" : ""}`}
                  onClick={() => { setActiveFilter(f); setCurrentPage(1); }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  <th>고객 ID</th>
                  <th>등급</th>
                  <th>최근 접속</th>
                  <th>구매빈도</th>
                  <th>이탈위험</th>
                  <th>CTR</th>
                  <th>쿠폰 사용률</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: 32, color: "#9BAAC0", fontSize: 13 }}>
                    {loading ? "불러오는 중..." : "데이터가 없습니다"}
                  </td></tr>
                ) : customers.map((c, i) => (
                  <tr key={i}>
                    <td className="db-td-id">{c.loginId}</td>
                    <td>
                      {c.grade === "VIP"
                        ? <span className="db-grade-badge">VIP</span>
                        : <span className="db-grade-text">{c.grade ?? "일반"}</span>}
                    </td>
                    <td className="db-td-gray">{c.lastLogin}</td>
                    <td>{c.purchaseFrequency}</td>
                    <td>
                      {c.churnRisk === "HIGH" || c.churnRisk === "높음"
                        ? <span className="db-churn-high">높음</span>
                        : <span className="db-td-muted">{c.churnRisk}</span>}
                    </td>
                    <td>{typeof c.ctr === "number" ? `${c.ctr.toFixed(2)}%` : c.ctr}</td>
                    <td>{typeof c.couponUsageRate === "number" ? `${c.couponUsageRate.toFixed(1)}%` : c.couponUsageRate}</td>
                    <td><button className="db-view-btn" onClick={() => onNavigateToCustomer?.(c.userId)}>보기 →</button></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="db-pagination">
              <button
                className="db-page-btn db-page-arrow"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                &lt;
              </button>
              {pageNumbers.map(p => (
                <button
                  key={p}
                  className={`db-page-btn ${currentPage === p ? "db-page-active" : ""}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="db-page-btn db-page-arrow"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}