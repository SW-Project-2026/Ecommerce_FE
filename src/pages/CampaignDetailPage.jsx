import { useState, useEffect } from "react";
import "./CampaignDetailPage.css";
import { campaignDelete, campaignUpdate, campaignStatusUpdate } from "../api/campaigns";
import { eventList } from "../api/events";

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
const STATUS_LABEL = {
  IN_PROGRESS: "수행중", PAUSED: "일시정지", ENDED: "종료",
};

const COUPONS = [
  { id: 1, name: "재구매 감사 쿠폰",    code: "THANKS10", discount: "10,000원 할인", expiry: "~ 2025-05-15" },
  { id: 2, name: "신규 회원 웰컴 쿠폰", code: "WELCOME5",  discount: "5% 할인",      expiry: "~ 2025-05-15" },
  { id: 3, name: "무료 배송 쿠폰",      code: "FREESHIP",  discount: "배송비 무료",   expiry: "~ 2025-05-15" },
  { id: 4, name: "여름 시즌 특별 할인", code: "SUMMER10",  discount: "10,000원 할인", expiry: "~ 2025-05-15" },
];
const CAT1_OPTIONS    = ["조기정착", "이탈방지", "재구매"];
const CAT2_OPTIONS    = {
  "조기정착": ["신규고객유치", "휴면 고객"],
  "이탈방지": ["VIP 고객", "일반 고객"],
  "재구매":   ["일반 고객", "휴면 고객"],
};
const BATCH_CYCLE_OPTIONS = ["매일", "매주", "매달"];
const HOUR_OPTIONS        = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTE_OPTIONS      = ["00", "10", "20", "30", "40", "50"];
const WEEKDAY_OPTIONS     = ["월", "화", "수", "목", "금", "토", "일"];
const MONTHDAY_OPTIONS    = Array.from({ length: 31 }, (_, i) => String(i + 1));

let filterIdCounter = 100;
const newFilter = () => ({
  id: ++filterIdCounter, eventId: null, event: "", field: "", dataType: "", operator: "", value: "", period: "7",
});

function today() {
  return new Date().toISOString().split("T")[0];
}

function initBatchSchedule(campaign) {
  const cycle      = CYCLE_DISPLAY_MAP[campaign?.batchCycle] ?? "매일";
  const timeStr    = campaign?.batchTime ?? "09:00";
  const [hour, minute] = timeStr.split(":").map(s => s.padStart(2, "0"));
  const dayOfWeek  = WEEKDAY_DISPLAY_MAP[campaign?.batchDayOfWeek] ?? "월";
  const dayOfMonth = campaign?.batchDayOfMonth ? String(campaign.batchDayOfMonth) : "1";
  return { cycle, hour, minute: minute ?? "00", dayOfWeek, dayOfMonth };
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

  useEffect(() => {
    setEventsLoading(true);
    eventList({ isActive: true })
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(err => console.error("이벤트 조회 실패:", err))
      .finally(() => setEventsLoading(false));
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

  // filters는 events 로드 후 useEffect에서 eventId 포함해서 설정
  const [filters,     setFilters]     = useState([]);
  const [filterLogic, setFilterLogic] = useState(campaign?.filterLogicalOperator ?? campaign?.logicalOperator ?? "AND");
  const [targetCount, setTargetCount] = useState(null);

  // events 로드 완료 후 필터에 eventId 매핑
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

  const [rewardTab,       setRewardTab]       = useState("쿠폰");
  const [selectedCoupons, setSelectedCoupons] = useState([1]);

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
        u.eventId  = ev?.eventId ?? null;
        u.field    = "";
        u.dataType = "";
        u.operator = "";
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

  const toggleCoupon     = id => setSelectedCoupons(p => p.includes(id) ? p.filter(c => c !== id) : [...p, id]);
  const handleCat1Change = v  => { setCat1(v); setCat2(CAT2_OPTIONS[v]?.[0] ?? ""); };

  const handleStartDateChange = (val) => {
    setStartDate(val);
    if (endDate < val) setEndDate(val);
  };

  function getBatchCycle()      { return CYCLE_MAP[batchSchedule.cycle] ?? "DAILY"; }
  function getBatchTime()       { return `${batchSchedule.hour}:${batchSchedule.minute}`; }
  function getBatchDayOfWeek()  { return batchSchedule.cycle === "매주" ? (WEEKDAY_MAP[batchSchedule.dayOfWeek] ?? null) : null; }
  function getBatchDayOfMonth() { return batchSchedule.cycle === "매달" ? parseInt(batchSchedule.dayOfMonth, 10) : null; }

  const handleDelete = async () => {
    setDeleting(true);
    setApiError(null);
    try {
      await campaignDelete({ campaignId: campaign.campaignId });
      onNavigate("list");
    } catch (err) {
      setApiError(err.message);
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setApiError(null);
    try {
      const apiFilters = filters.map(f => ({
        eventId:        f.eventId,
        eventFieldName: f.field,
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
        filters:               apiFilters,
      });
      setEditMode(false);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setApiError(null);
    try {
      const updated = await campaignStatusUpdate({ campaignId: campaign.campaignId, status: newStatus });
      setStatus(updated?.status ?? newStatus);
      setShowStatusModal(false);
    } catch (err) {
      setApiError(err.message);
      setShowStatusModal(false);
    }
  };

  const isReadOnly      = !editMode;
  const statusInfo      = STATUS_DISPLAY[status] ?? STATUS_DISPLAY["IN_PROGRESS"];
  const canChangeStatus = (STATUS_TRANSITIONS[status] ?? []).length > 0;

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
              <span className="cdp-fh cdp-fh-event">이벤트</span>
              <span className="cdp-fh cdp-fh-field">이벤트 수집 필드</span>
              <span className="cdp-fh cdp-fh-type">자료형</span>
              <span className="cdp-fh cdp-fh-op">조건</span>
              <span className="cdp-fh cdp-fh-val">값</span>
              <span className="cdp-fh cdp-fh-period">기간 (최근 N일)</span>
              {editMode && <span className="cdp-fh cdp-fh-del" />}
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
                  <div className="cdp-fc cdp-fh-event">
                    {isReadOnly ? <span className="cdp-cell-val">{f.event || "–"}</span>
                      : <select className="cdp-select cdp-select-sm" value={f.event} onChange={e => updateFilter(f.id, "event", e.target.value)} disabled={eventsLoading}>
                          <option value="">{eventsLoading ? "불러오는 중..." : "선택"}</option>
                          {events.map(ev => <option key={ev.eventId} value={ev.eventName}>{ev.eventName}</option>)}
                        </select>}
                  </div>
                  <div className="cdp-fc cdp-fh-field">
                    {isReadOnly ? <span className="cdp-cell-val">{f.field || "–"}</span>
                      : <select className="cdp-select cdp-select-sm" value={f.field} onChange={e => updateFilter(f.id, "field", e.target.value)} disabled={!f.event}>
                          <option value="">선택</option>
                          {(eventFieldMap[f.event] ?? []).map(fld => (
                            <option key={fld.fieldId} value={fld.fieldName}>{fld.fieldName}</option>
                          ))}
                        </select>}
                  </div>
                  <div className="cdp-fc cdp-fh-type">
                    {f.dataType
                      ? <span className={`cdp-type-badge ${f.dataType === "NUMBER" ? "cdp-type-number" : "cdp-type-string"}`}>{f.dataType}</span>
                      : <span className="cdp-type-empty">—</span>}
                  </div>
                  <div className="cdp-fc cdp-fh-op">
                    {isReadOnly ? <span className="cdp-cell-val">{f.operator || "–"}</span>
                      : <select className="cdp-select cdp-select-sm" value={f.operator} onChange={e => updateFilter(f.id, "operator", e.target.value)} disabled={!f.dataType}>
                          <option value="">선택</option>
                          {getOperators(f.dataType).map(op => <option key={op}>{op}</option>)}
                        </select>}
                  </div>
                  <div className="cdp-fc cdp-fh-val">
                    {isReadOnly ? <span className="cdp-cell-val">{f.value || "–"}</span>
                      : <input className="cdp-input cdp-input-sm" value={f.value} onChange={e => updateFilter(f.id, "value", e.target.value)} disabled={!f.operator} placeholder="값 입력" />}
                  </div>
                  <div className="cdp-fc cdp-fh-period">
                    {isReadOnly ? <span className="cdp-cell-val">최근 {f.period}일</span>
                      : <>
                          <span className="cdp-period-prefix">최근</span>
                          <input className="cdp-input cdp-input-period" type="number" min="1" value={f.period} onChange={e => updateFilter(f.id, "period", e.target.value)} />
                          <span className="cdp-period-suffix">일</span>
                        </>}
                  </div>
                  {editMode && (
                    <div className="cdp-fc cdp-fh-del">
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
          <div className="cdp-reward-tabs">
            {["쿠폰", "광고", "포인트"].map(t => (
              <button key={t} className={`cdp-reward-tab ${rewardTab === t ? "cdp-reward-tab-active" : ""}`} onClick={() => setRewardTab(t)}>{t}</button>
            ))}
          </div>
          {rewardTab === "쿠폰" && (
            <div className="cdp-coupon-list">
              <div className="cdp-coupon-header">
                <span className="cdp-ch" /><span className="cdp-ch">쿠폰명</span>
                <span className="cdp-ch">코드</span><span className="cdp-ch">할인 내용</span><span className="cdp-ch">유효기간</span>
              </div>
              {COUPONS.map(c => (
                <div key={c.id} className={`cdp-coupon-row ${selectedCoupons.includes(c.id) ? "cdp-coupon-selected" : ""} ${isReadOnly ? "cdp-coupon-readonly" : ""}`}>
                  <div className="cdp-coupon-check">
                    <div className={`cdp-checkbox ${selectedCoupons.includes(c.id) ? "cdp-checkbox-on" : ""}`} onClick={() => !isReadOnly && toggleCoupon(c.id)}>
                      {selectedCoupons.includes(c.id) && <span>✓</span>}
                    </div>
                  </div>
                  <div className="cdp-coupon-name">{c.name}</div>
                  <div className="cdp-coupon-code">{c.code}</div>
                  <div className="cdp-coupon-discount">{c.discount}</div>
                  <div className="cdp-coupon-expiry">{c.expiry}</div>
                </div>
              ))}
            </div>
          )}
          {rewardTab !== "쿠폰" && <div className="cdp-reward-empty">준비 중입니다</div>}
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