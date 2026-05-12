import { useState, useEffect } from "react";
import "./DataManagePage.css";
import { getProducts } from "../api/products";

const CYCLE_OPTIONS    = ["매일", "매주", "매달"];
const HOUR_OPTIONS     = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTE_OPTIONS   = ["00", "10", "20", "30", "40", "50"];
const WEEKDAY_OPTIONS  = ["월", "화", "수", "목", "금", "토", "일"];
const MONTHDAY_OPTIONS = Array.from({ length: 31 }, (_, i) => String(i + 1));

function DataSection({
  title,
  subtitle,
  statItems,
  collectMode,
  setCollectMode,
  schedule,
  setSchedule,
  notices,
}) {
  const updateSchedule = (key, val) => setSchedule(prev => ({ ...prev, [key]: val }));

  return (
    <div className="dm-section">
      <div className="dm-section-header">
        <h2 className="dm-section-title">{title}</h2>
        {subtitle && <p className="dm-section-sub">{subtitle}</p>}
      </div>

      <div className="dm-divider" />

      {/* 통계 카드 */}
      <div className="dm-stat-row">
        {statItems.map((s, i) => (
          <div key={i} className="dm-stat-card">
            <p className="dm-stat-label">{s.label}</p>
            <p className="dm-stat-value" style={{ color: s.color || "#212121" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* 수집 방식 */}
      <div className="dm-collect-section">

        {/* 수동 수집 */}
        <label className="dm-checkbox-label">
          <input
            type="checkbox"
            className="dm-checkbox"
            checked={collectMode === "manual"}
            onChange={() => setCollectMode("manual")}
          />
          <span className="dm-checkbox-text">수동 수집</span>
        </label>

        {/* 자동 스케줄 */}
        <label className="dm-checkbox-label dm-checkbox-label-mt">
          <input
            type="checkbox"
            className="dm-checkbox"
            checked={collectMode === "auto"}
            onChange={() => setCollectMode("auto")}
          />
          <span className="dm-checkbox-text">자동 스케줄</span>
        </label>

        {/* 스케줄 상세 (자동일 때만) */}
        {collectMode === "auto" && (
          <div className="dm-schedule-row">

            {/* 주기 */}
            <div className="dm-schedule-group">
              <span className="dm-schedule-label">주기</span>
              <div className="dm-select-wrap">
                <select
                  className="dm-select"
                  value={schedule.cycle}
                  onChange={e => updateSchedule("cycle", e.target.value)}
                >
                  {CYCLE_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* 매주: 요일 */}
            {schedule.cycle === "매주" && (
              <div className="dm-schedule-group">
                <span className="dm-schedule-label">요일</span>
                <div className="dm-select-wrap">
                  <select
                    className="dm-select"
                    value={schedule.dayOfWeek}
                    onChange={e => updateSchedule("dayOfWeek", e.target.value)}
                  >
                    {WEEKDAY_OPTIONS.map(d => <option key={d}>{d}요일</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* 매달: 날짜 */}
            {schedule.cycle === "매달" && (
              <div className="dm-schedule-group">
                <span className="dm-schedule-label">날짜</span>
                <div className="dm-select-wrap">
                  <select
                    className="dm-select"
                    value={schedule.dayOfMonth}
                    onChange={e => updateSchedule("dayOfMonth", e.target.value)}
                  >
                    {MONTHDAY_OPTIONS.map(d => <option key={d}>{d}일</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* 시 */}
            <div className="dm-schedule-group">
              <span className="dm-schedule-label">시</span>
              <div className="dm-select-wrap">
                <select
                  className="dm-select"
                  value={schedule.hour}
                  onChange={e => updateSchedule("hour", e.target.value)}
                >
                  {HOUR_OPTIONS.map(h => <option key={h}>{h}시</option>)}
                </select>
              </div>
            </div>

            {/* 분 */}
            <div className="dm-schedule-group">
              <span className="dm-schedule-label">분</span>
              <div className="dm-select-wrap">
                <select
                  className="dm-select"
                  value={schedule.minute}
                  onChange={e => updateSchedule("minute", e.target.value)}
                >
                  {MINUTE_OPTIONS.map(m => <option key={m}>{m}분</option>)}
                </select>
              </div>
            </div>

          </div>
        )}

        {/* 안내 메시지 */}
        {notices && notices.map((n, i) => (
          <div key={i} className={`dm-notice dm-notice-${n.type}`}>
            <span>{n.type === "success" ? "✓" : "⚠"}</span>
            <span>{n.text}</span>
          </div>
        ))}
      </div>

      {/* 수집하기 버튼 */}
      <div className="dm-section-footer">
        <button className="dm-btn-collect">수집하기</button>
      </div>
    </div>
  );
}

export default function DataManagePage() {
  const [productMode,     setProductMode]     = useState("manual");
  const [productSchedule, setProductSchedule] = useState({
    cycle:      "매일",
    hour:       "18",
    minute:     "00",
    dayOfWeek:  "월",
    dayOfMonth: "1",
  });
  const [totalCount, setTotalCount] = useState("로딩 중...");

  useEffect(() => {
    getProducts({ page: 0, size: 1 })
      .then(data => setTotalCount(data.totalElements?.toLocaleString() ?? "0"))
      .catch(() => setTotalCount("조회 실패"));
  }, []);

  return (
    <div className="dm-main">
      <div className="dm-page-header">
        <div>
          <h1 className="dm-page-title">데이터 관리</h1>
          <p className="dm-page-sub">상품·고객 행동 데이터를 수집하고 관리합니다</p>
        </div>
      </div>

      <div className="dm-content">
        <DataSection
          title="상품 데이터 관리"
          statItems={[
            { label: "총 상품 수",  value: totalCount },
            { label: "마지막 수집", value: "2026.04.28 18:00" },
            { label: "수집 상태",   value: "정상", color: "#2E7D4F" },
          ]}
          collectMode={productMode}
          setCollectMode={setProductMode}
          schedule={productSchedule}
          setSchedule={setProductSchedule}
        />
      </div>
    </div>
  );
}