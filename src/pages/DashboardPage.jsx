import { useEffect, useRef, useState } from "react";
import "./DashboardPage.css";
import { campaignList } from "../api/campaigns";

// ── 통계 카드 데이터 (광고→구매 전환율 제거) ──
const STAT_CARDS = [
  { label: "맞춤형 광고 노출수", value: "2,847,320", sub: "+12.4% 전주 대비", color: "#4F6EF7" },
  { label: "광고 클릭률 (CTR)",  value: "4.73%",     sub: "+0.8% 전주 대비",  color: "#2ABFBF" },
  { label: "발송 쿠폰 수",       value: "142,850",   sub: "+5.2% 전주 대비",  color: "#FF6B6B" },
  { label: "쿠폰 사용률",        value: "38.6%",     sub: "+2.1% 전주 대비",  color: "#FF6B6B" },
];

// ── 차트 바 데이터 ──
const CHART_BARS = [
  { time: "00:00", pct: 47 },
  { time: "03:00", pct: 74 },
  { time: "06:00", pct: 58 },
  { time: "09:00", pct: 89 },
  { time: "12:00", pct: 62 },
  { time: "15:00", pct: 85 },
  { time: "18:00", pct: 70 },
  { time: "21:00", pct: 99 },
];

// ── 도넛 차트 SVG ──
function DonutChart() {
  const used   = 38.6;
  const unused = 61.4;
  const r = 54;
  const cx = 70, cy = 70;
  const circumference = 2 * Math.PI * r;
  const usedDash   = (used   / 100) * circumference;
  const unusedDash = (unused / 100) * circumference;

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="#252A38"
        strokeWidth="16"
        strokeDasharray={`${unusedDash} ${circumference - unusedDash}`}
        strokeDashoffset={-(usedDash)}
        strokeLinecap="butt"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="#4F6EF7"
        strokeWidth="16"
        strokeDasharray={`${usedDash} ${circumference - usedDash}`}
        strokeDashoffset={0}
        strokeLinecap="butt"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text x={cx} y={cy - 6}  textAnchor="middle" fill="#F0F2FF" fontSize="15" fontWeight="700" fontFamily="Inter">38.6%</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#8892AA" fontSize="9"  fontFamily="Inter">사용률</text>
    </svg>
  );
}

export default function DashboardPage() {
  const [tick, setTick] = useState(0);
  const intervalRef = useRef(null);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);

  useEffect(() => {
    intervalRef.current = setInterval(() => setTick(t => t + 1), 1500);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    setCampaignsLoading(true);
    campaignList()
      .then(data => setCampaigns(Array.isArray(data) ? data : []))
      .catch(() => setCampaigns([]))
      .finally(() => setCampaignsLoading(false));
  }, []);

  return (
    <div className="db-main">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">전체 고객 대시보드</h1>
          <p className="db-page-sub">실시간 마케팅 캠페인 성과 모니터링</p>
        </div>
        <div className={`db-live-badge ${tick % 2 === 0 ? "db-live-on" : ""}`}>
          <span className="db-live-dot" />
          <span className="db-live-text">LIVE</span>
        </div>
      </div>

      <div className="db-content">

        {/* 통계 카드 */}
        <div className="db-stat-row">
          {STAT_CARDS.map((s, i) => (
            <div key={i} className="db-stat-card">
              <div className="db-stat-bar" style={{ background: s.color }} />
              <p className="db-stat-label">{s.label}</p>
              <p className="db-stat-value">{s.value}</p>
              <p className="db-stat-sub">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* 차트 행 */}
        <div className="db-chart-row">
          <div className="db-card db-card-wide">
            <div className="db-card-head">
              <span className="db-card-title">광고 노출 수 · 클릭률 추이 (실시간)</span>
              <span className="db-card-sub">최근 24시간</span>
            </div>
            <div className="db-bar-chart">
              <div className="db-bar-y-labels">
                {["100%", "80%", "60%", "40%", "20%"].map(l => (
                  <span key={l} className="db-y-label">{l}</span>
                ))}
              </div>
              <div className="db-bar-area">
                {CHART_BARS.map((b, i) => (
                  <div key={i} className="db-bar-col">
                    <div className="db-bar-track">
                      <div className="db-bar-fill" style={{ height: `${b.pct}%` }}>
                        <div className="db-bar-dot" />
                      </div>
                    </div>
                    <span className="db-bar-time">{b.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="db-card db-card-narrow">
            <div className="db-card-head">
              <span className="db-card-title">쿠폰 사용 현황</span>
            </div>
            <div className="db-donut-area">
              <DonutChart />
              <div className="db-donut-legend">
                <div className="db-legend-row">
                  <span className="db-legend-dot" style={{ background: "#4F6EF7" }} />
                  <span className="db-legend-text">사용됨 38.6%</span>
                </div>
                <div className="db-legend-row">
                  <span className="db-legend-dot" style={{ background: "#252A38" }} />
                  <span className="db-legend-text">미사용 61.4%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 캠페인 유형별 성과 */}
        <div className="db-card db-card-full">
          <div className="db-card-head">
            <span className="db-card-title">캠페인 유형별 성과</span>
          </div>
          <table className="db-table">
            <thead>
              <tr>
                <th>캠페인</th>
                <th>노출</th>
                <th>CTR</th>
                <th>쿠폰사용</th>
              </tr>
            </thead>
            <tbody>
              {campaignsLoading && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "#8892AA", padding: "20px" }}>
                    불러오는 중...
                  </td>
                </tr>
              )}
              {!campaignsLoading && campaigns.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "#8892AA", padding: "20px" }}>
                    캠페인이 없습니다
                  </td>
                </tr>
              )}
              {!campaignsLoading && campaigns.map((c) => (
                <tr key={c.campaignId}>
                  <td className="db-td-name">{c.campaignName}</td>
                  <td>–</td>
                  <td>–</td>
                  <td>–</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}