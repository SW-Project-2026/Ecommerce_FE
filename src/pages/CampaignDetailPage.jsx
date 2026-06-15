import { useState, useEffect, useRef } from "react";
import "./CampaignDetailPage.css";
import { campaignDelete, campaignUpdate, campaignStatusUpdate, getCampaignSmsStatus, retryCampaignSms } from "../api/campaigns";
import { eventList } from "../api/events";
import { couponList } from "../api/coupons";
import { adList } from "../api/ads";


const OPERATORS_NUMBER   = ["≥ (이상)", "≤ (이하)", "> (초과)", "< (미만)", "= (동등)"];
const OPERATORS_STRING   = ["포함", "= (동등)"];
const OPERATORS_DATETIME = ["≥ (이상)", "≤ (이하)", "> (초과)", "< (미만)", "= (동등)"];
const OPERATORS_DEFAULT  = ["= (동등)"];

function getOperators(fieldType) {
  switch (fieldType) {
    case "NUMBER":   return OPERATORS_NUMBER;
    case "STRING":   return OPERATORS_STRING;
    case "DATETIME":
    case "DATE":
    case "TIME":     return OPERATORS_DATETIME;
    default:         return OPERATORS_DEFAULT;
  }
}

const OPERATOR_MAP = {
  "≥ (이상)": "GTE", "≤ (이하)": "LTE", "> (초과)": "GT",
  "< (미만)": "LT",  "= (동등)": "EQUALS", "포함": "CONTAINS",
};
const OPERATOR_DISPLAY_MAP = {
  GTE: "≥ (이상)", LTE: "≤ (이하)", GT: "> (초과)",
  LT: "< (미만)", EQUALS: "= (동등)", CONTAINS: "포함",
  NOT_EQUALS: "≠", NOT_CONTAINS: "미포함", BETWEEN: "사이",
};
const COLLECTION_TYPE_MAP = { realtime: "TRIGGERED", batch: "BATCH" };
const GOAL_TYPE_MAP = {
  "조기정착": "EARLY_RETENTION", "이탈방지": "CHURN_PREVENTION", "재구매": "REPURCHASE",
};
const GOAL_TYPE_DISPLAY_MAP = {
  EARLY_RETENTION: "조기정착", CHURN_PREVENTION: "이탈방지", REPURCHASE: "재구매",
};
const SEGMENT_MAP = {
  "신규고객유치": "NEW", "VIP 고객": "VIP", "일반 고객": "GENERAL", "휴면 고객": "DORMANT",
};
const SEGMENT_DISPLAY_MAP = {
  NEW: "신규고객유치", VIP: "VIP 고객", GENERAL: "일반 고객", DORMANT: "휴면 고객", ALL: "전체",
};
const CYCLE_DISPLAY_MAP = { DAILY: "매일", WEEKLY: "매주", MONTHLY: "매달" };
const CYCLE_MAP = { "매일": "DAILY", "매주": "WEEKLY", "매달": "MONTHLY" };
const WEEKDAY_DISPLAY_MAP = {
  MONDAY: "월", TUESDAY: "화", WEDNESDAY: "수",
  THURSDAY: "목", FRIDAY: "금", SATURDAY: "토", SUNDAY: "일",
};
const WEEKDAY_MAP = {
  "월": "MONDAY", "화": "TUESDAY", "수": "WEDNESDAY",
  "목": "THURSDAY", "금": "FRIDAY", "토": "SATURDAY", "일": "SUNDAY",
};
const DISCOUNT_TYPE_DISPLAY = { FIXED: "정액", RATE: "정률" };
const TARGET_TYPE_DISPLAY   = { PRODUCT: "상품", CATEGORY: "카테고리", KEYWORD: "키워드" };

const STATUS_DISPLAY = {
  IN_PROGRESS: { cls: "cdp-badge-running", label: "수행중" },
  PAUSED:      { cls: "cdp-badge-paused",  label: "일시정지" },
  ENDED:       { cls: "cdp-badge-ended",   label: "종료" },
};
const STATUS_TRANSITIONS = {
  IN_PROGRESS: ["PAUSED", "ENDED"],
  PAUSED:      ["IN_PROGRESS", "ENDED"],
  ENDED:       [],
};
const STATUS_LABEL = { IN_PROGRESS: "수행중", PAUSED: "일시정지", ENDED: "종료" };

const ISSUANCE_METHOD_OPTIONS = [
  { label: "자동 지급", value: "AUTO" },
  { label: "다운로드",  value: "DOWNLOAD" },
  { label: "SMS",       value: "SMS" },
  { label: "LMS",       value: "LMS" },
];
const ISSUANCE_METHOD_DISPLAY = {
  AUTO: "자동 지급", DOWNLOAD: "다운로드", SMS: "SMS", LMS: "LMS",
  MESSAGE: "SMS",
};

const CAT1_OPTIONS = ["조기정착", "이탈방지", "재구매"];
const CAT2_OPTIONS = {
  "조기정착": ["신규고객유치", "휴면 고객"],
  "이탈방지": ["VIP 고객", "일반 고객"],
  "재구매":   ["일반 고객", "휴면 고객"],
};
const BATCH_CYCLE_OPTIONS = ["매일", "매주", "매달"];
const HOUR_OPTIONS        = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTE_OPTIONS      = ["00", "10", "20", "30", "40", "50"];
const WEEKDAY_OPTIONS     = ["월", "화", "수", "목", "금", "토", "일"];
const MONTHDAY_OPTIONS    = Array.from({ length: 31 }, (_, i) => String(i + 1));

const REWARD_ROW_HEIGHT    = 48;
const REWARD_HEADER_HEIGHT = 42;
const REWARD_MAX_ROWS      = 3;
const REWARD_MAX_HEIGHT    = REWARD_HEADER_HEIGHT + REWARD_ROW_HEIGHT * REWARD_MAX_ROWS;

let filterIdCounter = 100;
const newFilter = () => ({
  id: ++filterIdCounter, eventId: null, event: "", field: "", dataType: "", operator: "", value: "", period: "7",
});

function today() {
  return new Date().toISOString().split("T")[0];
}

// "2026-01-10" -> "2026-01-10T00:00:00.000+09:00"
function dateToIsoValue(dateStr) {
  if (!dateStr) return "";
  return `${dateStr}T00:00:00.000+09:00`;
}

// "2026-01-10T00:00:00.000+09:00" -> "2026-01-10"
function isoValueToDate(value) {
  if (!value) return "";
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}

function initBatchSchedule(campaign) {
  const cycle      = CYCLE_DISPLAY_MAP[campaign?.batchCycle] ?? "매일";
  const timeStr    = campaign?.batchTime ?? "09:00";
  const [hour, minute] = timeStr.split(":").map(s => s.padStart(2, "0"));
  const dayOfWeek  = WEEKDAY_DISPLAY_MAP[campaign?.batchDayOfWeek] ?? "월";
  const dayOfMonth = campaign?.batchDayOfMonth ? String(campaign.batchDayOfMonth) : "1";
  return { cycle, hour, minute: minute ?? "00", dayOfWeek, dayOfMonth };
}

const S = {
  rewardTable:        { width: "100%", borderRadius: 8, overflow: "hidden", border: "1px solid #EBEDF0" },
  rewardHeader:       { display: "grid", alignItems: "center", padding: "10px 16px", background: "#F7FAFF", borderBottom: "1px solid #EBEDF0" },
  rewardHeaderCoupon: { gridTemplateColumns: "36px 1.8fr 1fr 1fr 1fr" },
  rewardHeaderAd:     { gridTemplateColumns: "36px 2fr 1fr 1.2fr 1fr" },
  th:      { fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 700, fontSize: 11, color: "#9EA6B5" },
  row:     { display: "grid", alignItems: "center", padding: "12px 16px", background: "#FDFEFF", transition: "background 0.1s" },
  rowCoupon:   { gridTemplateColumns: "36px 1.8fr 1fr 1fr 1fr" },
  rowAd:       { gridTemplateColumns: "36px 2fr 1fr 1.2fr 1fr" },
  rowSelected: { background: "#F0F5FF" },
  name:    { fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 700, fontSize: 13, color: "#121212" },
  code:    { fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#4F6EF7" },
  cell:    { fontFamily: "'Noto Sans KR', sans-serif", fontSize: 12, color: "#333" },
  subCell: { fontFamily: "'Noto Sans KR', sans-serif", fontSize: 11, color: "#9EA6B5" },
};

const TIME_OPTIONS = Array.from({ length: 24 }, (_, h) =>
  ["00", "10", "20", "30", "40", "50"].map(m => `${String(h).padStart(2, "0")}:${m}`)
).flat();

function SendStatusSection({ campaignId, messageType, messageContent }) {
  const [logs,           setLogs]           = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [loadingMore,    setLoadingMore]     = useState(false);
  const [selected,       setSelected]       = useState(new Set());
  const todayStr = new Date().toISOString().split("T")[0];
  const [filterDate,     setFilterDate]     = useState(todayStr);
  const [filterTime,     setFilterTime]     = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [totalCount,     setTotalCount]     = useState(0);
  const [successCount,   setSuccessCount]   = useState(0);
  const [failCount,      setFailCount]      = useState(0);
  const [resending,      setResending]      = useState(false);
  const [error,          setError]          = useState(null);
  const [nextCursor,     setNextCursor]     = useState(null);
  const [hasNext,        setHasNext]        = useState(false);
  const tableRef = useRef(null);

  const fetchStatus = async (date, time, cursor = null) => {
    if (cursor) setLoadingMore(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await getCampaignSmsStatus({ campaignId, date: date || undefined, time: time || undefined, cursor: cursor || undefined });
      const newLogs = data?.targets?.content ?? [];
      setLogs(prev => cursor ? [...prev, ...newLogs] : newLogs);
      setNextCursor(data?.targets?.nextCursor ?? null);
      setHasNext(data?.targets?.hasNext ?? false);
      setSuccessCount(data?.todaySentCount ?? 0);
      setFailCount(data?.todayFailedCount ?? 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => { fetchStatus(todayStr, ""); }, []);

  // ── 스크롤 끝 감지 → 다음 페이지 로드 ──
  const handleScroll = () => {
    const el = tableRef.current;
    if (!el || loadingMore || !hasNext) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      fetchStatus(filterDate, filterTime, nextCursor);
    }
  };

  const toggleSelect = (loginId) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(loginId) ? next.delete(loginId) : next.add(loginId);
      return next;
    });
  };

  const handleSearch = () => {
    setLogs([]);
    setNextCursor(null);
    setHasNext(false);
    fetchStatus(filterDate, filterTime);
  };

  const handleReset = () => {
    setFilterDate(todayStr);
    setFilterTime("");
    setLogs([]);
    setNextCursor(null);
    setHasNext(false);
    fetchStatus(todayStr, "");
  };

  const handleResend = async () => {
    if (selected.size === 0) return;
    setResending(true);
    try {
      await retryCampaignSms({ campaignId, messageType: messageType ?? "SMS", content: messageContent ?? "" });
      setSelected(new Set());
      setLogs([]);
      setNextCursor(null);
      fetchStatus(filterDate, filterTime);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="cdp-send-section">
      <p className="cdp-send-summary">
        전송 성공 <strong>{successCount}명</strong> / 전송 실패 <strong style={{ color: "#F74F52" }}>{failCount}명</strong>
      </p>
      <div className="cdp-send-filter-row">
        <span className="cdp-send-title">사용자 조회</span>
        <div className="cdp-send-filter-inputs">
          <input type="date" className="cdp-send-date-input" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          <div className="cdp-send-time-wrap">
            <input className="cdp-send-time-input" placeholder="시간 선택" value={filterTime} readOnly onClick={() => setShowTimePicker(p => !p)} />
            {showTimePicker && (
              <div className="cdp-send-time-dropdown">
                <div className="cdp-send-time-list">
                  {TIME_OPTIONS.map(t => (
                    <div key={t} className={`cdp-send-time-item ${filterTime === t ? "cdp-send-time-item-active" : ""}`} onClick={() => { setFilterTime(t); setShowTimePicker(false); }}>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {(filterDate || filterTime) && <button className="cdp-send-reset-btn" onClick={handleReset}>✕</button>}
          <button className="cdp-send-search-btn" onClick={handleSearch}>조회</button>
        </div>
      </div>
      {error && <div style={{ fontSize: 12, color: "#B82B2B", marginBottom: 8 }}>{error}</div>}
      <div className="cdp-send-table" ref={tableRef} onScroll={handleScroll}>
        {loading ? (
          <div style={{ padding: 24, textAlign: "center", fontSize: 12, color: "#9EA6B5" }}>불러오는 중...</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", fontSize: 12, color: "#BFBFBF" }}>발송 내역이 없습니다</div>
        ) : logs.map((log, i) => (
          <div key={i} className="cdp-send-row">
            <div className={`cdp-send-check ${selected.has(log.loginId) ? "cdp-send-check-on" : ""}`} onClick={() => log.status === "FAILED" && toggleSelect(log.loginId)} style={{ cursor: log.status === "FAILED" ? "pointer" : "default" }}>
              {selected.has(log.loginId) && "✓"}
            </div>
            <span className="cdp-send-loginid">{log.loginId}</span>
            <span className={`cdp-send-status ${log.status === "FAILED" ? "cdp-send-failed" : "cdp-send-success"}`}>
              {log.status === "FAILED" ? "전송 실패" : "전송 성공"}
            </span>
            <span className="cdp-send-date">{log.sentAt?.substring(0, 16).replace("T", " ")}</span>
          </div>
        ))}
        {loadingMore && (
          <div style={{ padding: 12, textAlign: "center", fontSize: 12, color: "#9EA6B5" }}>불러오는 중...</div>
        )}
      </div>
      <div className="cdp-send-footer">
        <button className="cdp-btn-resend" onClick={handleResend} disabled={selected.size === 0 || resending}>
          {resending ? "재전송 중..." : "재전송"}
        </button>
      </div>
    </div>
  );
}

function DeleteModal({ campaignName, onConfirm, onCancel }) {
  return (
    <div className="cdp-modal-backdrop" onClick={onCancel}>
      <div className="cdp-modal" onClick={e => e.stopPropagation()}>
        <div className="cdp-modal-header">
          <h2 className="cdp-modal-title">캠페인 삭제</h2>
          <button className="cdp-modal-close" onClick={onCancel}>✕</button>
        </div>
        <div className="cdp-modal-body">
          <p className="cdp-modal-desc"><strong>"{campaignName}"</strong> 캠페인을 삭제하시겠습니까?</p>
          <p className="cdp-modal-warn">삭제된 캠페인은 복구할 수 없습니다.</p>
        </div>
        <div className="cdp-modal-footer">
          <button className="cdp-btn-cancel" onClick={onCancel}>취소</button>
          <button className="cdp-btn-delete-confirm" onClick={onConfirm}>삭제</button>
        </div>
      </div>
    </div>
  );
}

function StatusModal({ currentStatus, onConfirm, onCancel }) {
  const options = STATUS_TRANSITIONS[currentStatus] ?? [];
  const [selected, setSelected] = useState(options[0] ?? "");
  return (
    <div className="cdp-modal-backdrop" onClick={onCancel}>
      <div className="cdp-modal" onClick={e => e.stopPropagation()}>
        <div className="cdp-modal-header">
          <h2 className="cdp-modal-title">캠페인 상태 변경</h2>
          <button className="cdp-modal-close" onClick={onCancel}>✕</button>
        </div>
        <div className="cdp-modal-body">
          <p className="cdp-modal-desc" style={{ marginBottom: 16 }}>변경할 상태를 선택하세요.</p>
          <div className="cdp-status-options">
            {options.length === 0
              ? <p className="cdp-modal-warn">더 이상 변경 가능한 상태가 없습니다.</p>
              : options.map(s => (
                  <label key={s} className="cdp-status-option">
                    <input type="radio" name="status" value={s} checked={selected === s} onChange={() => setSelected(s)} />
                    <span className={`cdp-status-badge ${STATUS_DISPLAY[s]?.cls}`}>{STATUS_LABEL[s] ?? s}</span>
                  </label>
                ))
            }
          </div>
        </div>
        <div className="cdp-modal-footer">
          <button className="cdp-btn-cancel" onClick={onCancel}>취소</button>
          {options.length > 0 && <button className="cdp-btn-save" onClick={() => onConfirm(selected)}>변경</button>}
        </div>
      </div>
    </div>
  );
}

export default function CampaignDetailPage({ campaign, onNavigate }) {
  const [editMode,        setEditMode]       = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const [events,        setEvents]        = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [coupons,       setCoupons]       = useState([]);
  const [ads,           setAds]           = useState([]);
  const [rewardLoading, setRewardLoading] = useState(false);

  useEffect(() => {
    setEventsLoading(true);
    eventList({ isActive: true })
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(err => console.error("이벤트 조회 실패:", err))
      .finally(() => setEventsLoading(false));

    setRewardLoading(true);
    Promise.all([couponList(), adList()])
      .then(([couponData, adData]) => {
        setCoupons(Array.isArray(couponData) ? couponData : []);
        setAds(Array.isArray(adData) ? adData : []);
      })
      .catch(err => console.error("리워드 조회 실패:", err))
      .finally(() => setRewardLoading(false));
  }, []);

  const eventFieldMap = events.reduce((acc, ev) => {
    acc[ev.eventName] = ev.fields ?? [];
    return acc;
  }, {});

  const [name,      setName]      = useState(campaign?.campaignName ?? "");
  const [cat1,      setCat1]      = useState(GOAL_TYPE_DISPLAY_MAP[campaign?.campaignGoalType] ?? campaign?.campaignGoalType ?? "조기정착");
  const [cat2,      setCat2]      = useState(SEGMENT_DISPLAY_MAP[campaign?.customerSegment]    ?? campaign?.customerSegment   ?? "신규고객유치");
  const [startDate, setStartDate] = useState((campaign?.startedAt ?? "").substring(0, 10));
  const [endDate,   setEndDate]   = useState((campaign?.endedAt   ?? "").substring(0, 10));
  const [desc,      setDesc]      = useState(campaign?.description ?? "");
  const [status,    setStatus]    = useState(campaign?.status ?? "IN_PROGRESS");

  const [filters,     setFilters]     = useState([]);
  const [filterLogic, setFilterLogic] = useState(campaign?.filterLogicalOperator ?? campaign?.logicalOperator ?? "AND");
  const [targetCount, setTargetCount] = useState(null);

  useEffect(() => {
    if (events.length === 0) return;
    const mapped = (campaign?.filters ?? []).map((f, i) => {
      const ev = events.find(e => e.eventName === f.eventName);
      return {
        id:       100 + i,
        eventId:  ev?.eventId ?? null,
        event:    f.eventName  ?? "",
        field:    f.fieldName  ?? "",
        dataType: f.fieldType  ?? "",
        operator: OPERATOR_DISPLAY_MAP[f.operator] ?? f.operator ?? "",
        value:    f.value      ?? "",
        period:   String(f.periodDays ?? 7),
      };
    });
    setFilters(mapped);
  }, [events]);

  const [selectedCoupon, setSelectedCoupon] = useState(campaign?.couponId ?? null);
  const [selectedAd,     setSelectedAd]     = useState(campaign?.adId     ?? null);

  const [dedupeType, setDedupeType] = useState(campaign?.duplicatePolicy === "CHECK" ? "period" : "none");
  const [dedupeDays, setDedupeDays] = useState(campaign?.couponRestrictionDays ? String(campaign.couponRestrictionDays) : "30");

  const [issuanceMethod, setIssuanceMethod] = useState(() => {
    const t = campaign?.issueType ?? "AUTO";
    // legacy MESSAGING → map to messageType if available
    if (t === "MESSAGE" || t === "MESSAGING") return campaign?.messageType === "LMS" ? "LMS" : "SMS";
    return t;
  });
  const [msgContent,     setMsgContent]     = useState(campaign?.messageContent ?? "");
  const [msgTitle,       setMsgTitle]       = useState(campaign?.messageSubject ?? "");
  const isMessaging = issuanceMethod === "SMS" || issuanceMethod === "LMS";
  const isLms       = issuanceMethod === "LMS";

  const initialTab = campaign?.adId ? "광고" : "쿠폰";
  const [rewardTab, setRewardTab] = useState(initialTab);

  const handleSelectCoupon = (id) => { setSelectedCoupon(prev => prev === id ? null : id); setSelectedAd(null); };
  const handleSelectAd     = (id) => { setSelectedAd(prev => prev === id ? null : id); setSelectedCoupon(null); };

  const [processType,   setProcessType]   = useState(campaign?.collectionType === "BATCH" ? "batch" : "realtime");
  const [batchSchedule, setBatchSchedule] = useState(initBatchSchedule(campaign));
  const updateBatch = (k, v) => setBatchSchedule(p => ({ ...p, [k]: v }));

  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const addFilter    = () => setFilters(p => [...p, newFilter()]);
  const removeFilter = id => setFilters(p => p.filter(f => f.id !== id));
  const updateFilter = (id, key, val) => {
    setFilters(p => p.map(f => {
      if (f.id !== id) return f;
      const u = { ...f, [key]: val };
      if (key === "event") {
        const ev = events.find(e => e.eventName === val);
        u.eventId = ev?.eventId ?? null;
        u.field = ""; u.dataType = ""; u.operator = "";
      }
      if (key === "field") {
        const fields  = eventFieldMap[u.event] ?? [];
        const matched = fields.find(fld => fld.fieldName === val);
        u.dataType = matched?.fieldType ?? "";
        u.operator = "";
      }
      return u;
    }));
  };

  const handleCat1Change = v => { setCat1(v); setCat2(CAT2_OPTIONS[v]?.[0] ?? ""); };
  const handleStartDateChange = (val) => { setStartDate(val); if (endDate < val) setEndDate(val); };

  function getBatchCycle()      { return CYCLE_MAP[batchSchedule.cycle] ?? "DAILY"; }
  function getBatchTime()       { return `${batchSchedule.hour}:${batchSchedule.minute}`; }
  function getBatchDayOfWeek()  { return batchSchedule.cycle === "매주" ? (WEEKDAY_MAP[batchSchedule.dayOfWeek] ?? null) : null; }
  function getBatchDayOfMonth() { return batchSchedule.cycle === "매달" ? parseInt(batchSchedule.dayOfMonth, 10) : null; }

  const handleDelete = async () => {
    setDeleting(true); setApiError(null);
    try {
      await campaignDelete({ campaignId: campaign.campaignId });
      onNavigate("list");
    } catch (err) { setApiError(err.message); setShowDeleteModal(false); }
    finally { setDeleting(false); }
  };

  const handleSave = async () => {
    setSaving(true); setApiError(null);
    try {
      const apiFilters = filters.map(f => ({
        eventId:        f.eventId,
        eventName:      f.event,
        eventFieldName: f.field,
        fieldType:      f.dataType,
        operator:       OPERATOR_MAP[f.operator] ?? f.operator,
        value:          f.value,
        periodDays:     parseInt(f.period, 10),
      }));
      await campaignUpdate({
        campaignId:            campaign.campaignId,
        campaignName:          name,
        description:           desc,
        campaignGoalType:      GOAL_TYPE_MAP[cat1] ?? cat1,
        customerSegment:       SEGMENT_MAP[cat2]   ?? cat2,
        startedAt:             startDate,
        endedAt:               endDate,
        collectionType:        COLLECTION_TYPE_MAP[processType],
        batchCycle:            processType === "batch" ? getBatchCycle()      : null,
        batchTime:             processType === "batch" ? getBatchTime()       : null,
        batchDayOfWeek:        processType === "batch" ? getBatchDayOfWeek()  : null,
        batchDayOfMonth:       processType === "batch" ? getBatchDayOfMonth() : null,
        filterLogicalOperator: filterLogic,
        couponId:              selectedCoupon ?? null,
        adId:                  selectedAd     ?? null,
        issueType:             isMessaging ? "MESSAGE" : issuanceMethod,
        messageType:           isMessaging ? (isLms ? "LMS" : "SMS") : null,
        messageSubject:        isLms ? msgTitle : null,
        messageContent:        isMessaging ? msgContent : null,
        duplicatePolicy:       dedupeType === "period" ? "CHECK" : null,
        couponRestrictionDays: dedupeType === "period" ? parseInt(dedupeDays, 10) : null,
        filters:               apiFilters,
      });
      setEditMode(false);
    } catch (err) { setApiError(err.message); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (newStatus) => {
    setApiError(null);
    try {
      const updated = await campaignStatusUpdate({ campaignId: campaign.campaignId, status: newStatus });
      setStatus(updated?.status ?? newStatus);
      setShowStatusModal(false);
    } catch (err) { setApiError(err.message); setShowStatusModal(false); }
  };

  const isReadOnly      = !editMode;
  const statusInfo      = STATUS_DISPLAY[status] ?? STATUS_DISPLAY["IN_PROGRESS"];
  const canChangeStatus = (STATUS_TRANSITIONS[status] ?? []).length > 0;

  const displayCoupons = isReadOnly && selectedCoupon ? coupons.filter(c => c.couponId === selectedCoupon) : coupons;
  const displayAds     = isReadOnly && selectedAd     ? ads.filter(a => a.adId === selectedAd)             : ads;

  const visibleTabs = isReadOnly
    ? selectedCoupon ? ["쿠폰"] : selectedAd ? ["광고"] : []
    : ["쿠폰", "광고"];

  const dedupeReadLabel = dedupeType === "period"
    ? `기간 설정 — ${dedupeDays}일 이내 수신 이력 있으면 발송 제외`
    : "사용 안 함";

  const selectedCouponName = coupons.find(c => c.couponId === selectedCoupon)?.name ?? "쿠폰명";
  const showSendStatus = isReadOnly && selectedCoupon && isMessaging;
  const issuanceReadLabel = ISSUANCE_METHOD_DISPLAY[issuanceMethod] ?? issuanceMethod;

  return (
    <div className="cdp-main">
      {showDeleteModal && <DeleteModal campaignName={name} onConfirm={handleDelete} onCancel={() => setShowDeleteModal(false)} />}
      {showStatusModal && <StatusModal currentStatus={status} onConfirm={handleStatusChange} onCancel={() => setShowStatusModal(false)} />}

      <div className="cdp-page-header">
        <div>
          <div className="cdp-header-top">
            <button className="cdp-back-btn" onClick={() => onNavigate("list")}>← 목록</button>
            <span className={`cdp-status-badge ${statusInfo?.cls ?? ""}`}>{statusInfo?.label ?? status}</span>
            {canChangeStatus && !editMode && (
              <button className="cdp-btn-status" onClick={() => setShowStatusModal(true)}>상태 변경</button>
            )}
          </div>
          <h1 className="cdp-page-title">{name || "캠페인 상세"}</h1>
          <p className="cdp-page-sub">
            {campaign?.campaignId && <span className="cdp-campaign-id">{campaign.campaignId}</span>}
            {campaign?.createdBy  && <span> · 기안자: {campaign.createdBy}</span>}
            {campaign?.createdAt  && <span> · {campaign.createdAt}</span>}
          </p>
        </div>
        <div className="cdp-header-btns">
          {editMode ? (
            <>
              <button className="cdp-btn-cancel" onClick={() => { setEditMode(false); setApiError(null); }} disabled={saving}>취소</button>
              <button className="cdp-btn-save" onClick={handleSave} disabled={saving}>{saving ? "저장 중..." : "✓ 저장하기"}</button>
            </>
          ) : (
            <>
              <button className="cdp-btn-delete" onClick={() => setShowDeleteModal(true)} disabled={deleting}>삭제</button>
              <button className="cdp-btn-edit" onClick={() => setEditMode(true)}>수정</button>
            </>
          )}
        </div>
      </div>

      {apiError && <div className="cdp-api-error">{apiError}</div>}

      {/* 기본 정보 */}
      <div className="cdp-section">
        <div className="cdp-section-head">기본 정보</div>
        <div className="cdp-section-body">
          <div className="cdp-field-row">
            <label className="cdp-label">캠페인명</label>
            {isReadOnly ? <span className="cdp-value">{name}</span>
              : <input className="cdp-input cdp-input-wide" value={name} onChange={e => setName(e.target.value)} />}
          </div>
          <div className="cdp-field-row">
            <label className="cdp-label">캠페인 분류</label>
            {isReadOnly ? <span className="cdp-value">{cat1} &gt; {cat2}</span>
              : <>
                  <select className="cdp-select" value={cat1} onChange={e => handleCat1Change(e.target.value)}>
                    {CAT1_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <select className="cdp-select" value={cat2} onChange={e => setCat2(e.target.value)}>
                    {(CAT2_OPTIONS[cat1] ?? []).map(o => <option key={o}>{o}</option>)}
                  </select>
                </>}
          </div>
          <div className="cdp-field-row">
            <label className="cdp-label">수행 일자</label>
            {isReadOnly ? <span className="cdp-value">{startDate} ~ {endDate}</span>
              : <>
                  <input type="date" className="cdp-input cdp-input-date" value={startDate} min={today()} onChange={e => handleStartDateChange(e.target.value)} />
                  <span className="cdp-tilde">~</span>
                  <input type="date" className="cdp-input cdp-input-date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} />
                </>}
          </div>
          <div className="cdp-field-col">
            <label className="cdp-label">캠페인 설명</label>
            {isReadOnly ? <span className="cdp-value cdp-value-desc">{desc || "–"}</span>
              : <textarea className="cdp-textarea" value={desc} onChange={e => setDesc(e.target.value)} placeholder="캠페인 목적이나 대상을 간단히 입력해주세요" />}
          </div>
        </div>
      </div>

      {/* 필터링 설정 */}
      <div className="cdp-section">
        <div className="cdp-section-head">
          필터링 설정
          {editMode && filters.length > 1 && (
            <div className="cdp-filter-logic-toggle">
              <span className="cdp-filter-logic-label">조건 연산:</span>
              <button className={`cdp-logic-badge ${filterLogic === "OR" ? "cdp-logic-or" : ""}`} onClick={() => setFilterLogic(p => p === "AND" ? "OR" : "AND")}>
                {filterLogic}
              </button>
            </div>
          )}
        </div>
        <div className="cdp-section-body">
          <div className="cdp-filter-table-wrap">
            <div className="cdp-filter-header">
              <span className="cdp-fh">이벤트</span>
              <span className="cdp-fh">이벤트 수집 필드</span>
              <span className="cdp-fh">자료형</span>
              <span className="cdp-fh">조건</span>
              <span className="cdp-fh">값</span>
              <span className="cdp-fh">기간 (최근 N일)</span>
              {editMode && <span className="cdp-fh" />}
            </div>
            {filters.length === 0 && (
              <div className="cdp-filter-empty">{editMode ? "조건을 추가해주세요" : "설정된 필터 조건이 없습니다"}</div>
            )}
            {filters.map((f, idx) => (
              <div key={f.id}>
                {idx > 0 && (
                  <div className="cdp-and-row">
                    <span className="cdp-and-line" />
                    <span className={`cdp-logic-badge ${filterLogic === "OR" ? "cdp-logic-or" : ""}`}>{filterLogic}</span>
                    <span className="cdp-and-line" />
                  </div>
                )}
                <div className="cdp-filter-row">
                  <div className="cdp-fc">
                    {isReadOnly ? <span className="cdp-cell-val">{f.event || "–"}</span>
                      : <select className="cdp-select cdp-select-sm" value={f.event} onChange={e => updateFilter(f.id, "event", e.target.value)} disabled={eventsLoading}>
                          <option value="">{eventsLoading ? "불러오는 중..." : "선택"}</option>
                          {events.map(ev => <option key={ev.eventId} value={ev.eventName}>{ev.eventName}</option>)}
                        </select>}
                  </div>
                  <div className="cdp-fc">
                    {isReadOnly ? <span className="cdp-cell-val">{f.field || "–"}</span>
                      : <select className="cdp-select cdp-select-sm" value={f.field} onChange={e => updateFilter(f.id, "field", e.target.value)} disabled={!f.event}>
                          <option value="">선택</option>
                          {(eventFieldMap[f.event] ?? []).map(fld => (
                            <option key={fld.fieldId} value={fld.fieldName}>{fld.fieldName}</option>
                          ))}
                        </select>}
                  </div>
                  <div className="cdp-fc">
                    {f.dataType
                      ? <span className={`cdp-type-badge ${f.dataType === "NUMBER" ? "cdp-type-number" : "cdp-type-string"}`}>{f.dataType}</span>
                      : <span className="cdp-type-empty">—</span>}
                  </div>
                  <div className="cdp-fc">
                    {isReadOnly ? <span className="cdp-cell-val">{f.operator || "–"}</span>
                      : <select className="cdp-select cdp-select-sm" value={f.operator} onChange={e => updateFilter(f.id, "operator", e.target.value)} disabled={!f.dataType}>
                          <option value="">선택</option>
                          {getOperators(f.dataType).map(op => <option key={op}>{op}</option>)}
                        </select>}
                  </div>
                  <div className="cdp-fc">
                    {isReadOnly ? <span className="cdp-cell-val">{(f.dataType === "DATETIME" || f.dataType === "DATE") ? (isoValueToDate(f.value) || f.value || "–") : (f.value || "–")}</span>
                      : (f.dataType === "DATETIME" || f.dataType === "DATE") ? (
                          <input
                            type="date"
                            className="cdp-input cdp-input-sm"
                            value={isoValueToDate(f.value)}
                            onChange={e => updateFilter(f.id, "value", dateToIsoValue(e.target.value))}
                            disabled={!f.operator}
                          />
                        ) : (
                          <input className="cdp-input cdp-input-sm" value={f.value} onChange={e => updateFilter(f.id, "value", e.target.value)} disabled={!f.operator} placeholder="값 입력" />
                        )}
                  </div>
                  <div className="cdp-fc">
                    {isReadOnly ? <span className="cdp-cell-val">최근 {f.period}일</span>
                      : <>
                          <span className="cdp-period-prefix">최근</span>
                          <input className="cdp-input cdp-input-period" type="number" min="1" value={f.period} onChange={e => updateFilter(f.id, "period", e.target.value)} />
                          <span className="cdp-period-suffix">일</span>
                        </>}
                  </div>
                  {editMode && (
                    <div className="cdp-fc">
                      <button className="cdp-del-btn" onClick={() => removeFilter(f.id)}>✕</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {editMode && (
            <div className="cdp-filter-footer">
              <div className="cdp-target-area">
                {targetCount !== null && <span className="cdp-target-text">예상 대상: <strong>{targetCount}명</strong></span>}
                <button className="cdp-btn-query" onClick={() => setTargetCount(Math.floor(Math.random() * 50) + 1)}>고객 수 조회</button>
              </div>
              <button className="cdp-btn-add-filter" onClick={addFilter}>+ 조건 추가</button>
            </div>
          )}
        </div>
      </div>

      {/* 리워드 / 광고 설정 */}
      <div className="cdp-section">
        <div className="cdp-section-head">리워드 / 광고 설정</div>
        <div className="cdp-section-body">
          {visibleTabs.length > 0 && (
            <div className="cdp-reward-tabs">
              {visibleTabs.map(t => (
                <button key={t} className={`cdp-reward-tab ${rewardTab === t ? "cdp-reward-tab-active" : ""}`} onClick={() => setRewardTab(t)}>{t}</button>
              ))}
            </div>
          )}

          {isReadOnly && !selectedCoupon && !selectedAd && (
            <div className="cdp-reward-empty">선택된 리워드가 없습니다</div>
          )}

          {rewardLoading && <div style={{ padding: 16, fontSize: 12, color: "#9EA6B5" }}>불러오는 중...</div>}

          {!rewardLoading && rewardTab === "쿠폰" && visibleTabs.includes("쿠폰") && (
            <>
              <div style={{ ...S.rewardTable, maxHeight: displayCoupons.length > REWARD_MAX_ROWS ? REWARD_MAX_HEIGHT : "none", overflow: displayCoupons.length > REWARD_MAX_ROWS ? "auto" : "visible" }}>
                <div style={{ ...S.rewardHeader, ...S.rewardHeaderCoupon, position: "sticky", top: 0, zIndex: 1 }}>
                  <span style={S.th} /><span style={S.th}>쿠폰명</span><span style={S.th}>코드</span><span style={S.th}>할인</span><span style={S.th}>유효기간</span>
                </div>
                {displayCoupons.length === 0 ? (
                  <div className="cdp-reward-empty">등록된 쿠폰이 없습니다</div>
                ) : displayCoupons.map((c, idx) => {
                  const isSelected = selectedCoupon === c.couponId;
                  return (
                    <div key={c.couponId} style={{ ...S.row, ...S.rowCoupon, ...(isSelected ? S.rowSelected : {}), borderBottom: idx === displayCoupons.length - 1 ? "none" : "0.5px solid #F0F2F5" }}>
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <div onClick={() => !isReadOnly && handleSelectCoupon(c.couponId)} style={{ width: 17, height: 17, borderRadius: 4, border: isSelected ? "none" : "1.5px solid #D0D5DD", background: isSelected ? "#4F6EF7" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: isReadOnly ? "default" : "pointer", fontSize: 10, color: "#fff", fontWeight: 700 }}>
                          {isSelected && "✓"}
                        </div>
                      </div>
                      <span style={S.name}>{c.name}</span>
                      <span style={S.code}>{c.code}</span>
                      <span style={S.cell}>
                        {c.discountType === "RATE" ? `${c.discountAmount}%` : `${c.discountAmount?.toLocaleString()}원`}
                        <span style={{ fontSize: 10, color: "#9EA6B5", marginLeft: 4 }}>({DISCOUNT_TYPE_DISPLAY[c.discountType]})</span>
                      </span>
                      <span style={S.subCell}>{c.expiredAt}일</span>
                    </div>
                  );
                })}
              </div>

              {isReadOnly ? (
                <div className="cdp-dedupe-readonly">
                  <span className="cdp-dedupe-readonly-label">중복 발송 제어</span>
                  <span className="cdp-dedupe-readonly-value">{dedupeReadLabel}</span>
                </div>
              ) : (
                <div className="cdp-dedupe-section">
                  <div className="cdp-dedupe-cards">
                    <div className={`cdp-dedupe-card ${dedupeType === "none" ? "cdp-dedupe-card-inactive" : "cdp-dedupe-card-default"}`} onClick={() => setDedupeType("none")}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid #E0E4E8", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {dedupeType === "none" && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#E0E4E8" }} />}
                      </div>
                      <div>
                        <div className="cdp-dedupe-card-title" style={{ color: dedupeType === "none" ? "#0F1E3D" : "#9EA6B5" }}>사용 안 함</div>
                        <div className="cdp-dedupe-card-desc" style={{ color: dedupeType === "none" ? "rgba(90,106,138,0.75)" : "#C0C5D0" }}>중복 제거 없이 조건 충족 시 항상 발송</div>
                      </div>
                    </div>
                    <div className={`cdp-dedupe-card ${dedupeType === "period" ? "cdp-dedupe-card-active" : "cdp-dedupe-card-default"}`} onClick={() => setDedupeType("period")}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", border: dedupeType === "period" ? "1.5px solid #4F6EF7" : "1.5px solid #A6A8B8", background: dedupeType === "period" ? "#4F6EF7" : "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {dedupeType === "period" && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFFFFF" }} />}
                      </div>
                      <div>
                        <div className="cdp-dedupe-card-title" style={{ color: dedupeType === "period" ? "#4F6EF7" : "#0F1E3D" }}>기간 설정</div>
                        <div className="cdp-dedupe-card-desc" style={{ color: dedupeType === "period" ? "rgba(79,110,247,0.75)" : "rgba(90,106,138,0.75)" }}>N일 이내 수신 이력 있는 고객은 발송에서 제외</div>
                      </div>
                    </div>
                  </div>
                  {dedupeType === "period" && (
                    <div className="cdp-dedupe-period-row">
                      <span className="cdp-dedupe-period-label">제한 기간</span>
                      <input className="cdp-input cdp-dedupe-period-input" type="number" min="1" value={dedupeDays} onChange={e => setDedupeDays(e.target.value)} />
                      <span className="cdp-dedupe-period-suffix">일 이내 수신 이력 있으면 발송 제외</span>
                    </div>
                  )}
                </div>
              )}

              {isReadOnly ? (
                <div className="cdp-dedupe-readonly" style={{ marginTop: 10 }}>
                  <span className="cdp-dedupe-readonly-label">발급 방식</span>
                  <span className="cdp-dedupe-readonly-value">{issuanceReadLabel}</span>
                </div>
              ) : (
                <div style={{ marginTop: 16 }}>
                  <p className="cdp-reward-sub-label">발급 방식</p>
                  <div className="cdp-issuance-group">
                    {ISSUANCE_METHOD_OPTIONS.map(opt => (
                      <label key={opt.value} className="cdp-issuance-label">
                        <input type="radio" name="issuanceMethod" checked={issuanceMethod === opt.value} onChange={() => setIssuanceMethod(opt.value)} className="cdp-issuance-radio" />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  {isMessaging && (
                    <div className="cdp-msg-wrap">
                      {isLms && (
                        <input
                          className="cdp-input cdp-input-wide"
                          placeholder="제목 입력 (LMS 제목)"
                          value={msgTitle}
                          onChange={e => setMsgTitle(e.target.value)}
                          maxLength={40}
                          style={{ marginBottom: 8, display: "block", width: "100%" }}
                        />
                      )}
                      <textarea
                        className="cdp-msg-textarea"
                        placeholder={`예) [Da-On] 회원님께 특별 쿠폰을 발송해드립니다.\n쿠폰명: ${selectedCouponName}\n앱에서 바로 사용해보세요!`}
                        value={msgContent}
                        onChange={e => setMsgContent(e.target.value)}
                        maxLength={isLms ? 2000 : 90}
                      />
                      <p className="cdp-msg-char-count">{msgContent.length} / {isLms ? "2000" : "90"}자</p>
                    </div>
                  )}
                </div>
              )}

              {showSendStatus && <SendStatusSection campaignId={campaign.campaignId} messageType={isLms ? "LMS" : "SMS"} messageContent={msgContent} />}
            </>
          )}

          {!rewardLoading && rewardTab === "광고" && visibleTabs.includes("광고") && (
            <div style={{ ...S.rewardTable, maxHeight: displayAds.length > REWARD_MAX_ROWS ? REWARD_MAX_HEIGHT : "none", overflow: displayAds.length > REWARD_MAX_ROWS ? "auto" : "visible" }}>
              <div style={{ ...S.rewardHeader, ...S.rewardHeaderAd, position: "sticky", top: 0, zIndex: 1 }}>
                <span style={S.th} /><span style={S.th}>광고명</span><span style={S.th}>타겟 유형</span><span style={S.th}>타겟 값</span><span style={S.th}>생성일</span>
              </div>
              {displayAds.length === 0 ? (
                <div className="cdp-reward-empty">등록된 광고가 없습니다</div>
              ) : displayAds.map((a, idx) => {
                const isSelected = selectedAd === a.adId;
                const targetVal  = a.targetType === "PRODUCT" ? `ID: ${a.productId}` : (a.category || a.keyword || "–");
                return (
                  <div key={a.adId} style={{ ...S.row, ...S.rowAd, ...(isSelected ? S.rowSelected : {}), borderBottom: idx === displayAds.length - 1 ? "none" : "0.5px solid #F0F2F5" }}>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <div onClick={() => !isReadOnly && handleSelectAd(a.adId)} style={{ width: 17, height: 17, borderRadius: 4, border: isSelected ? "none" : "1.5px solid #D0D5DD", background: isSelected ? "#4F6EF7" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: isReadOnly ? "default" : "pointer", fontSize: 10, color: "#fff", fontWeight: 700 }}>
                        {isSelected && "✓"}
                      </div>
                    </div>
                    <span style={S.name}>{a.adName}</span>
                    <span style={{ ...S.cell, fontSize: 11 }}>{TARGET_TYPE_DISPLAY[a.targetType] ?? a.targetType}</span>
                    <span style={S.code}>{targetVal}</span>
                    <span style={S.subCell}>{a.createdAt?.substring(0, 10)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 처리 방식 설정 */}
      <div className="cdp-section cdp-section-last">
        <div className="cdp-process-title">처리 방식 설정</div>
        <div className="cdp-process-sub">캠페인 조건 충족 고객에게 리워드를 전달하는 방식을 선택합니다</div>
        <div className="cdp-section-divider" />
        <div className="cdp-process-cards">
          {["realtime", "batch"].map(type => (
            <div key={type} className={`cdp-process-card ${processType === type ? "cdp-process-card-active" : ""} ${isReadOnly ? "cdp-process-card-readonly" : ""}`} onClick={() => !isReadOnly && setProcessType(type)}>
              <div className="cdp-pc-top">
                <div className={`cdp-pc-radio ${processType === type ? "cdp-pc-radio-on" : ""}`}>
                  {processType === type && <div className="cdp-pc-radio-dot" />}
                </div>
                <span className={`cdp-pc-badge ${type === "realtime" ? "cdp-pc-badge-kafka" : "cdp-pc-badge-batch"}`}>
                  {type === "realtime" ? "Kafka" : "배치"}
                </span>
              </div>
              <div className={`cdp-pc-name ${processType !== type ? "cdp-pc-name-inactive" : ""}`}>
                {type === "realtime" ? "실시간 처리" : "배치 처리"}
              </div>
              <div className="cdp-pc-desc cdp-pc-desc-inactive">
                {type === "realtime" ? "행동 이벤트 발생 즉시 조건 확인 후 리워드 발송" : "주기적으로 DB 전체를 스캔하여 조건 충족 고객 선정"}
              </div>
              <div className="cdp-pc-divider" />
              <ul className="cdp-pc-list cdp-pc-list-inactive">
                {type === "realtime"
                  ? <><li>이벤트 발생 즉시 처리 (초 단위)</li><li>캠페인 시작 이후 이벤트만 처리</li></>
                  : <><li>설정한 주기마다 전체 DB 스캔</li><li>과거 누적 데이터 포함 조건 검사</li></>}
              </ul>
            </div>
          ))}
        </div>

        {processType === "batch" && (
          <div className="cdp-batch-schedule">
            <div className="cdp-batch-schedule-title">배치 스케줄 설정</div>
            <div className="cdp-batch-row">
              <div className="cdp-batch-group">
                <span className="cdp-batch-label">주기</span>
                <select className="cdp-batch-select" value={batchSchedule.cycle} onChange={e => updateBatch("cycle", e.target.value)} disabled={isReadOnly}>
                  {BATCH_CYCLE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              {batchSchedule.cycle === "매주" && (
                <div className="cdp-batch-group">
                  <span className="cdp-batch-label">요일</span>
                  <select className="cdp-batch-select" value={batchSchedule.dayOfWeek} onChange={e => updateBatch("dayOfWeek", e.target.value)} disabled={isReadOnly}>
                    {WEEKDAY_OPTIONS.map(d => <option key={d} value={d}>{d}요일</option>)}
                  </select>
                </div>
              )}
              {batchSchedule.cycle === "매달" && (
                <div className="cdp-batch-group">
                  <span className="cdp-batch-label">날짜</span>
                  <select className="cdp-batch-select" value={batchSchedule.dayOfMonth} onChange={e => updateBatch("dayOfMonth", e.target.value)} disabled={isReadOnly}>
                    {MONTHDAY_OPTIONS.map(d => <option key={d} value={d}>{d}일</option>)}
                  </select>
                </div>
              )}
              <div className="cdp-batch-group">
                <span className="cdp-batch-label">시</span>
                <select className="cdp-batch-select" value={batchSchedule.hour} onChange={e => updateBatch("hour", e.target.value)} disabled={isReadOnly}>
                  {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h}시</option>)}
                </select>
              </div>
              <div className="cdp-batch-group">
                <span className="cdp-batch-label">분</span>
                <select className="cdp-batch-select" value={batchSchedule.minute} onChange={e => updateBatch("minute", e.target.value)} disabled={isReadOnly}>
                  {MINUTE_OPTIONS.map(m => <option key={m} value={m}>{m}분</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {editMode && (
          <div className="cdp-footer-btns">
            <button className="cdp-btn-cancel" onClick={() => { setEditMode(false); setApiError(null); }} disabled={saving}>취소</button>
            <button className="cdp-btn-save" onClick={handleSave} disabled={saving}>{saving ? "저장 중..." : "✓ 저장하기"}</button>
          </div>
        )}
      </div>
    </div>
  );
}