import { useState, useEffect } from "react";
import "./DataManagePage.css";
import { getProducts, syncProducts, getSchedule, setSchedule as setScheduleApi, cancelSchedule } from "../api/products";

const CYCLE_OPTIONS    = ["매일", "매주", "매달"];
const HOUR_OPTIONS     = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTE_OPTIONS   = ["00", "10", "20", "30", "40", "50"];
const WEEKDAY_OPTIONS  = ["월", "화", "수", "목", "금", "토", "일"];
const MONTHDAY_OPTIONS = Array.from({ length: 31 }, (_, i) => String(i + 1));

const CYCLE_MAP         = { "매일": "DAILY", "매주": "WEEKLY", "매달": "MONTHLY" };
const CYCLE_DISPLAY_MAP = { DAILY: "매일", WEEKLY: "매주", MONTHLY: "매달" };

function formatDate(isoString) {
  if (!isoString) return "–";
  return new Date(isoString).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function DataManagePage() {
  const [collectMode,     setCollectMode]     = useState("manual");
  const [schedule,        setSchedule_]       = useState({
    cycle:      "매일",
    hour:       "03",
    minute:     "00",
    dayOfWeek:  "월",
    dayOfMonth: "1",
  });

  const [totalCount,      setTotalCount]      = useState("로딩 중...");
  const [lastSynced,      setLastSynced]      = useState("–");
  const [syncStatus,      setSyncStatus]      = useState("–");
  const [currentSchedule, setCurrentSchedule] = useState(null);

  const [collecting, setCollecting] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [notice,     setNotice]     = useState(null);

  const updateSchedule = (key, val) => setSchedule_(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    fetchStats();
    fetchSchedule();
  }, []);

  async function fetchStats() {
    try {
      const data = await getProducts({ page: 0, size: 1 });
      setTotalCount(data.totalElements?.toLocaleString() ?? "0");
    } catch {
      setTotalCount("조회 실패");
    }
  }

  async function fetchSchedule() {
    try {
      const data = await getSchedule();
      if (data === null) {
        setCurrentSchedule(null);
        return;
      }
      setCurrentSchedule(data);
      setLastSynced(formatDate(data.lastSyncedAt));
      setSyncStatus(data.syncStatus === "IDLE" ? "정상" : data.syncStatus ?? "–");
    } catch {
      setCurrentSchedule(null);
    }
  }

  async function handleCollect() {
    if (collectMode === "manual") {
      setCollecting(true);
      setNotice(null);
      try {
        const data = await syncProducts();
        setNotice({ type: "success", text: `수집 완료 — ${data.savedCount?.toLocaleString()}개 저장됨` });
        if (data.lastSyncedAt) {
          setLastSynced(formatDate(data.lastSyncedAt));
          setSyncStatus(data.syncStatus ?? "정상");
        }
        fetchStats();
        fetchSchedule();
      } catch (err) {
        setNotice({ type: "error", text: err.message });
        setSyncStatus("오류");
      } finally {
        setCollecting(false);
      }
    } else {
      setScheduling(true);
      setNotice(null);
      try {
        const cycle = CYCLE_MAP[schedule.cycle] ?? "DAILY";
        const time  = `${schedule.hour}:${schedule.minute}`;
        await setScheduleApi({ cycle, time });
        setNotice({ type: "success", text: `자동 스케줄 등록 완료 — ${schedule.cycle} ${time}` });
        fetchSchedule();
      } catch (err) {
        setNotice({ type: "error", text: err.message });
      } finally {
        setScheduling(false);
      }
    }
  }

  async function handleCancel() {
    setCancelling(true);
    setNotice(null);
    try {
      await cancelSchedule();
      setNotice({ type: "success", text: "자동 스케줄이 취소되었습니다." });
      setCurrentSchedule(null);
      fetchSchedule();
    } catch (err) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setCancelling(false);
    }
  }

  const isLoading = collecting || scheduling || cancelling;

  return (
    <div className="dm-main">
      <div className="dm-page-header">
        <div>
          <h1 className="dm-page-title">데이터 관리</h1>
          <p className="dm-page-sub">상품·고객 행동 데이터를 수집하고 관리합니다</p>
        </div>
      </div>

      <div className="dm-content">
        <div className="dm-section">
          <div className="dm-section-header">
            <h2 className="dm-section-title">상품 데이터 관리</h2>
          </div>

          <div className="dm-divider" />

          <div className="dm-stat-row">
            <div className="dm-stat-card">
              <p className="dm-stat-label">총 상품 수</p>
              <p className="dm-stat-value">{totalCount}</p>
            </div>
            <div className="dm-stat-card">
              <p className="dm-stat-label">마지막 수집</p>
              <p className="dm-stat-value">{lastSynced}</p>
            </div>
            <div className="dm-stat-card">
              <p className="dm-stat-label">수집 상태</p>
              <p className="dm-stat-value" style={{ color: syncStatus === "정상" ? "#2E7D4F" : "#666" }}>
                {syncStatus}
              </p>
            </div>
          </div>

          <div className="dm-collect-section">
            <label className="dm-checkbox-label">
              <input type="checkbox" className="dm-checkbox" checked={collectMode === "manual"} onChange={() => setCollectMode("manual")} />
              <span className="dm-checkbox-text">수동 수집</span>
            </label>

            <label className="dm-checkbox-label dm-checkbox-label-mt">
              <input type="checkbox" className="dm-checkbox" checked={collectMode === "auto"} onChange={() => setCollectMode("auto")} />
              <span className="dm-checkbox-text">자동 스케줄</span>
            </label>

            {collectMode === "auto" && (
              <div className="dm-schedule-row">
                <div className="dm-schedule-group">
                  <span className="dm-schedule-label">주기</span>
                  <div className="dm-select-wrap">
                    <select className="dm-select" value={schedule.cycle} onChange={e => updateSchedule("cycle", e.target.value)}>
                      {CYCLE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                {schedule.cycle === "매주" && (
                  <div className="dm-schedule-group">
                    <span className="dm-schedule-label">요일</span>
                    <div className="dm-select-wrap">
                      <select className="dm-select" value={schedule.dayOfWeek} onChange={e => updateSchedule("dayOfWeek", e.target.value)}>
                        {WEEKDAY_OPTIONS.map(d => <option key={d} value={d}>{d}요일</option>)}
                      </select>
                    </div>
                  </div>
                )}
                {schedule.cycle === "매달" && (
                  <div className="dm-schedule-group">
                    <span className="dm-schedule-label">날짜</span>
                    <div className="dm-select-wrap">
                      <select className="dm-select" value={schedule.dayOfMonth} onChange={e => updateSchedule("dayOfMonth", e.target.value)}>
                        {MONTHDAY_OPTIONS.map(d => <option key={d} value={d}>{d}일</option>)}
                      </select>
                    </div>
                  </div>
                )}
                <div className="dm-schedule-group">
                  <span className="dm-schedule-label">시</span>
                  <div className="dm-select-wrap">
                    <select className="dm-select" value={schedule.hour} onChange={e => updateSchedule("hour", e.target.value)}>
                      {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h}시</option>)}
                    </select>
                  </div>
                </div>
                <div className="dm-schedule-group">
                  <span className="dm-schedule-label">분</span>
                  <div className="dm-select-wrap">
                    <select className="dm-select" value={schedule.minute} onChange={e => updateSchedule("minute", e.target.value)}>
                      {MINUTE_OPTIONS.map(m => <option key={m} value={m}>{m}분</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {notice && (
              <div className={`dm-notice dm-notice-${notice.type}`}>
                <span>{notice.type === "success" ? "✓" : "⚠"}</span>
                <span>{notice.text}</span>
              </div>
            )}
          </div>

          <div className="dm-section-footer">
            <button className="dm-btn-collect" onClick={handleCollect} disabled={isLoading}>
              {collecting ? "수집 중..." : scheduling ? "등록 중..." : "수집하기"}
            </button>
          </div>

          <div className="dm-divider" style={{ marginTop: 24 }} />
          <div className="dm-schedule-list-section">
            <h3 className="dm-schedule-list-title">자동 스케줄 목록</h3>
            {currentSchedule && currentSchedule.active ? (
              <div className="dm-schedule-item">
                <div className="dm-schedule-item-info">
                  <span className="dm-schedule-badge">활성</span>
                  <span className="dm-schedule-item-text">
                    {CYCLE_DISPLAY_MAP[currentSchedule.cycle] ?? currentSchedule.cycle}
                    {" · "}
                    {currentSchedule.scheduledTime}
                  </span>
                  {currentSchedule.nextRunAt && (
                    <span className="dm-schedule-item-sub">
                      다음 실행: {formatDate(currentSchedule.nextRunAt)}
                    </span>
                  )}
                </div>
                <button className="dm-btn-cancel-schedule" onClick={handleCancel} disabled={cancelling}>
                  {cancelling ? "취소 중..." : "취소"}
                </button>
              </div>
            ) : (
              <div className="dm-schedule-empty">등록된 자동 스케줄이 없습니다</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}