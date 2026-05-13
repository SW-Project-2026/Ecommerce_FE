import { useState, useEffect } from "react";
import "./CampaignCreatePage.css";
import { campaignCreate } from "../api/campaigns";
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
  "≥ (이상)": "GTE",
  "≤ (이하)": "LTE",
  "> (초과)": "GT",
  "< (미만)": "LT",
  "= (동등)": "EQUALS",
  "포함":     "CONTAINS",
};

const COLLECTION_TYPE_MAP = {
  realtime: "TRIGGERED",
  batch:    "BATCH",
};

const GOAL_TYPE_MAP = {
  "조기정착": "EARLY_RETENTION",
  "이탈방지": "CHURN_PREVENTION",
  "재구매":   "REPURCHASE",
};

const SEGMENT_MAP = {
  "신규고객유치": "NEW",
  "VIP 고객":    "VIP",
  "일반 고객":   "GENERAL",
  "휴면 고객":   "DORMANT",
};

// batchSchedule.cycle → API batchCycle 문자열 변환
const CYCLE_MAP = {
  "매일": "DAILY",
  "매주": "WEEKLY",
  "매달": "MONTHLY",
};

// batchSchedule.dayOfWeek → API batchDayOfWeek 문자열 변환
const WEEKDAY_MAP = {
  "월": "MONDAY", "화": "TUESDAY", "수": "WEDNESDAY",
  "목": "THURSDAY", "금": "FRIDAY", "토": "SATURDAY", "일": "SUNDAY",
};

const COUPONS = [
  { id: 1, name: "재구매 감사 쿠폰",    code: "THANKS10", discount: "10,000원 할인", expiry: "~ 2025-05-15" },
  { id: 2, name: "신규 회원 웰컴 쿠폰", code: "WELCOME5",  discount: "5% 할인",      expiry: "~ 2025-05-15" },
  { id: 3, name: "무료 배송 쿠폰",      code: "FREESHIP",  discount: "배송비 무료",   expiry: "~ 2025-05-15" },
  { id: 4, name: "여름 시즌 특별 할인", code: "SUMMER10",  discount: "10,000원 할인", expiry: "~ 2025-05-15" },
];

const CAT1_OPTIONS = ["조기정착", "이탈방지", "재구매"];
const CAT2_OPTIONS = {
  "조기정착": ["신규고객유치", "휴면 고객"],
  "이탈방지": ["VIP 고객", "일반 고객"],
  "재구매":   ["일반 고객", "휴면 고객"],
};

const HOUR_OPTIONS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTE_OPTIONS = ["00", "10", "20", "30", "40", "50"];

let filterIdCounter = 0;
const newFilter = () => ({
  id: ++filterIdCounter,
  eventId:  null,
  event:    "",
  field:    "",
  dataType: "",
  operator: "",
  value:    "",
  period:   "7",
});

function today() {
  return new Date().toISOString().split("T")[0];
}

export default function CampaignCreatePage({ onNavigate }) {
  const [name,      setName]      = useState("");
  const [cat1,      setCat1]      = useState("조기정착");
  const [cat2,      setCat2]      = useState("신규고객유치");
  const [startDate, setStartDate] = useState(today());
  const [endDate,   setEndDate]   = useState(today());
  const [desc,      setDesc]      = useState("");

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

  const [filters,     setFilters]     = useState([]);
  const [filterLogic, setFilterLogic] = useState("AND");
  const [targetCount, setTargetCount] = useState(null);

  const [rewardTab,      setRewardTab]      = useState("쿠폰");
  const [selectedReward, setSelectedReward] = useState({ type: null, id: null });

  const handleRewardTabChange = (tab) => {
    setRewardTab(tab);
    setSelectedReward({ type: null, id: null });
  };

  const handleSelectCoupon = (id) => {
    if (selectedReward.type === "쿠폰" && selectedReward.id === id) {
      setSelectedReward({ type: null, id: null });
    } else {
      setSelectedReward({ type: "쿠폰", id });
    }
  };

  const [processType,   setProcessType]   = useState("realtime");
  const [batchSchedule, setBatchSchedule] = useState({
    cycle: "매일", hour: "09", minute: "00", dayOfWeek: "월", dayOfMonth: "1",
  });
  const updateBatch = (key, val) => setBatchSchedule(prev => ({ ...prev, [key]: val }));

  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(null);

  const addFilter    = () => setFilters(prev => [...prev, newFilter()]);
  const removeFilter = (id) => setFilters(prev => prev.filter(f => f.id !== id));
  const updateFilter = (id, key, val) => {
    setFilters(prev => prev.map(f => {
      if (f.id !== id) return f;
      const updated = { ...f, [key]: val };
      if (key === "event") {
        // 이벤트 선택 시 eventId도 함께 저장
        const ev = events.find(e => e.eventName === val);
        updated.eventId  = ev?.eventId ?? null;
        updated.field    = "";
        updated.dataType = "";
        updated.operator = "";
      }
      if (key === "field") {
        const fields  = eventFieldMap[updated.event] ?? [];
        const matched = fields.find(fld => fld.fieldName === val);
        updated.dataType = matched?.fieldType ?? "";
        updated.operator = "";
      }
      return updated;
    }));
  };

  const handleCat1Change = (v) => { setCat1(v); setCat2(CAT2_OPTIONS[v]?.[0] ?? ""); };

  const handleStartDateChange = (val) => {
    setStartDate(val);
    if (endDate < val) setEndDate(val);
  };

  // batchSchedule → API 파라미터 변환
  function getBatchCycle()      { return CYCLE_MAP[batchSchedule.cycle] ?? "DAILY"; }
  function getBatchTime()       { return `${batchSchedule.hour}:${batchSchedule.minute}`; }
  function getBatchDayOfWeek()  { return WEEKDAY_MAP[batchSchedule.dayOfWeek] ?? null; }
  function getBatchDayOfMonth() { return batchSchedule.cycle === "매달" ? parseInt(batchSchedule.dayOfMonth, 10) : null; }

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const apiFilters = filters.map(f => ({
        eventId:        f.eventId,
        eventFieldName: f.field,
        operator:       OPERATOR_MAP[f.operator] ?? f.operator,
        value:          f.value,
        periodDays:     parseInt(f.period, 10),
      }));

      await campaignCreate({
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

      onNavigate && onNavigate("list");
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cc-main">

      <div className="cc-page-header">
        <div>
          <h1 className="cc-page-title">캠페인 생성</h1>
          <p className="cc-page-sub">새 캠페인을 설정합니다</p>
        </div>
      </div>

      {/* 기본 정보 입력 */}
      <div className="cc-section">
        <div className="cc-section-head">기본 정보 입력</div>
        <div className="cc-section-body">

          <div className="cc-field-row">
            <label className="cc-label">캠페인명 <span className="cc-req">*</span></label>
            <input className="cc-input cc-input-wide" placeholder="예) 4월 신규회원 웰컴 캠페인" value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div className="cc-field-row">
            <label className="cc-label">캠페인 분류 <span className="cc-req">*</span></label>
            <select className="cc-select" value={cat1} onChange={e => handleCat1Change(e.target.value)}>
              {CAT1_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
            <select className="cc-select" value={cat2} onChange={e => setCat2(e.target.value)}>
              {(CAT2_OPTIONS[cat1] ?? []).map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          <div className="cc-field-row">
            <label className="cc-label">수행 일자 <span className="cc-req">*</span></label>
            <input type="date" className="cc-input cc-input-date" value={startDate} min={today()} onChange={e => handleStartDateChange(e.target.value)} />
            <span className="cc-tilde">~</span>
            <input type="date" className="cc-input cc-input-date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} />
          </div>

          <div className="cc-field-col">
            <label className="cc-label">캠페인 설명</label>
            <textarea className="cc-textarea" placeholder="캠페인 목적이나 대상을 간단히 입력해주세요" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>

        </div>
      </div>

      {/* 필터링 설정 */}
      <div className="cc-section">
        <div className="cc-section-head">
          필터링 설정
          {filters.length > 1 && (
            <div className="cc-filter-logic-toggle">
              <span className="cc-filter-logic-label">조건 연산:</span>
              <button className={`cc-logic-badge ${filterLogic === "OR" ? "cc-logic-or" : ""}`} onClick={() => setFilterLogic(prev => prev === "AND" ? "OR" : "AND")}>
                {filterLogic}
              </button>
            </div>
          )}
        </div>
        <div className="cc-section-body">
          <div className="cc-filter-table-wrap">
            <div className="cc-filter-header">
              <span className="cc-fh cc-fh-event">이벤트</span>
              <span className="cc-fh cc-fh-field">이벤트 수집 필드</span>
              <span className="cc-fh cc-fh-type">자료형</span>
              <span className="cc-fh cc-fh-op">조건</span>
              <span className="cc-fh cc-fh-val">값</span>
              <span className="cc-fh cc-fh-period">
                기간 (최근 N일)
                <span style={{ display: "block", fontSize: 10, fontWeight: "normal", color: processType === "batch" ? "#4F6EF7" : "#999", marginTop: 2 }}>
                  {processType === "batch" ? "배치 처리 시 적용" : "실시간 처리 시 미적용"}
                </span>
              </span>
              <span className="cc-fh cc-fh-del" />
            </div>

            {filters.map((f, idx) => (
              <div key={f.id}>
                {idx > 0 && (
                  <div className="cc-and-row">
                    <span className="cc-and-line" />
                    <span className={`cc-logic-badge ${filterLogic === "OR" ? "cc-logic-or" : ""}`}>{filterLogic}</span>
                    <span className="cc-and-line" />
                  </div>
                )}
                <div className="cc-filter-row">
                  <div className="cc-fc cc-fh-event">
                    <select className="cc-select cc-select-sm" value={f.event} onChange={e => updateFilter(f.id, "event", e.target.value)} disabled={eventsLoading}>
                      <option value="">{eventsLoading ? "불러오는 중..." : "선택"}</option>
                      {events.map(ev => <option key={ev.eventId} value={ev.eventName}>{ev.eventName}</option>)}
                    </select>
                  </div>
                  <div className="cc-fc cc-fh-field">
                    <select className="cc-select cc-select-sm" value={f.field} onChange={e => updateFilter(f.id, "field", e.target.value)} disabled={!f.event}>
                      <option value="">선택</option>
                      {(eventFieldMap[f.event] ?? []).map(fld => (
                        <option key={fld.fieldId} value={fld.fieldName}>{fld.fieldName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="cc-fc cc-fh-type">
                    {f.dataType
                      ? <span className={`cc-type-badge ${f.dataType === "NUMBER" ? "cc-type-number" : "cc-type-string"}`}>{f.dataType}</span>
                      : <span className="cc-type-empty">—</span>
                    }
                  </div>
                  <div className="cc-fc cc-fh-op">
                    <select className="cc-select cc-select-sm" value={f.operator} onChange={e => updateFilter(f.id, "operator", e.target.value)} disabled={!f.dataType}>
                      <option value="">선택</option>
                      {getOperators(f.dataType).map(op => <option key={op}>{op}</option>)}
                    </select>
                  </div>
                  <div className="cc-fc cc-fh-val">
                    <input className="cc-input cc-input-sm" placeholder="값 입력" value={f.value} onChange={e => updateFilter(f.id, "value", e.target.value)} disabled={!f.operator} />
                  </div>
                  <div className="cc-fc cc-fh-period">
                    <span className="cc-period-prefix">최근</span>
                    <input
                      className="cc-input cc-input-period"
                      type="number"
                      min="1"
                      value={f.period}
                      onChange={e => updateFilter(f.id, "period", e.target.value)}
                      style={{ opacity: processType === "batch" ? 1 : 0.4 }}
                    />
                    <span className="cc-period-suffix">일</span>
                  </div>
                  <div className="cc-fc cc-fh-del">
                    <button className="cc-del-btn" onClick={() => removeFilter(f.id)}>✕</button>
                  </div>
                </div>
              </div>
            ))}

            {filters.length === 0 && <div className="cc-filter-empty">조건을 추가해주세요</div>}
          </div>

          <div className="cc-filter-footer">
            <div className="cc-target-area">
              {targetCount !== null && (
                <span className="cc-target-text">예상 대상: <strong className="cc-target-num">{targetCount}명</strong></span>
              )}
              <button className="cc-btn-query" onClick={() => setTargetCount(Math.floor(Math.random() * 50) + 1)}>고객 수 조회</button>
            </div>
            <button className="cc-btn-add-filter" onClick={addFilter}>+ 조건 추가</button>
          </div>
        </div>
      </div>

      {/* 리워드 / 광고 설정 */}
      <div className="cc-section">
        <div className="cc-section-head">
          리워드 / 광고 설정
          {selectedReward.type && (
            <span style={{ fontSize: 12, color: "#4F6EF7", marginLeft: 8 }}>
              ({selectedReward.type} 1개 선택됨)
            </span>
          )}
        </div>
        <div className="cc-section-body">
          <div className="cc-reward-tabs">
            {["쿠폰", "광고", "포인트"].map(t => (
              <button key={t} className={`cc-reward-tab ${rewardTab === t ? "cc-reward-tab-active" : ""}`} onClick={() => handleRewardTabChange(t)}>{t}</button>
            ))}
          </div>

          {rewardTab === "쿠폰" && (
            <div className="cc-coupon-list">
              <div className="cc-coupon-header">
                <span className="cc-ch" /><span className="cc-ch">쿠폰명</span>
                <span className="cc-ch">코드</span><span className="cc-ch">할인 내용</span><span className="cc-ch">유효기간</span>
              </div>
              {COUPONS.map(c => {
                const isSelected = selectedReward.type === "쿠폰" && selectedReward.id === c.id;
                return (
                  <div key={c.id} className={`cc-coupon-row ${isSelected ? "cc-coupon-selected" : ""}`}>
                    <div className="cc-coupon-check">
                      <div className={`cc-checkbox ${isSelected ? "cc-checkbox-on" : ""}`} onClick={() => handleSelectCoupon(c.id)}>
                        {isSelected && <span>✓</span>}
                      </div>
                    </div>
                    <div className="cc-coupon-name">{c.name}</div>
                    <div className="cc-coupon-code">{c.code}</div>
                    <div className="cc-coupon-discount">{c.discount}</div>
                    <div className="cc-coupon-expiry">{c.expiry}</div>
                  </div>
                );
              })}
            </div>
          )}
          {rewardTab !== "쿠폰" && <div className="cc-reward-empty">준비 중입니다</div>}
        </div>
      </div>

      {/* 처리 방식 설정 */}
      <div className="cc-section cc-section-last">
        <div className="cc-process-title">처리 방식 설정</div>
        <div className="cc-process-sub">캠페인 조건 충족 고객에게 리워드를 전달하는 방식을 선택합니다</div>
        <div className="cc-section-divider" />
        <div className="cc-process-cards">
          <div className={`cc-process-card ${processType === "realtime" ? "cc-process-card-active" : ""}`} onClick={() => setProcessType("realtime")}>
            <div className="cc-pc-top">
              <div className={`cc-pc-radio ${processType === "realtime" ? "cc-pc-radio-on" : ""}`}>
                {processType === "realtime" && <div className="cc-pc-radio-dot" />}
              </div>
              <span className="cc-pc-badge cc-pc-badge-kafka">Kafka</span>
            </div>
            <div className="cc-pc-name">실시간 처리</div>
            <div className="cc-pc-desc">행동 이벤트 발생 즉시 조건 확인 후 리워드 발송</div>
            <div className="cc-pc-divider" />
            <ul className="cc-pc-list">
              <li>이벤트 발생 즉시 처리 (초 단위)</li>
              <li>캠페인 시작 이후 이벤트만 처리</li>
            </ul>
          </div>
          <div className={`cc-process-card ${processType === "batch" ? "cc-process-card-active" : ""}`} onClick={() => setProcessType("batch")}>
            <div className="cc-pc-top">
              <div className={`cc-pc-radio ${processType === "batch" ? "cc-pc-radio-on" : ""}`}>
                {processType === "batch" && <div className="cc-pc-radio-dot" />}
              </div>
              <span className="cc-pc-badge cc-pc-badge-batch">배치</span>
            </div>
            <div className={`cc-pc-name ${processType !== "batch" ? "cc-pc-name-inactive" : ""}`}>배치 처리</div>
            <div className="cc-pc-desc cc-pc-desc-inactive">주기적으로 DB 전체를 스캔하여 조건 충족 고객 선정</div>
            <div className="cc-pc-divider" />
            <ul className="cc-pc-list cc-pc-list-inactive">
              <li>설정한 주기마다 전체 DB 스캔</li>
              <li>과거 누적 데이터 포함 조건 검사</li>
            </ul>
          </div>
        </div>

        {processType === "batch" && (
          <div className="cc-batch-schedule">
            <div className="cc-batch-schedule-title">배치 스케줄 설정</div>
            <div className="cc-batch-row">
              <div className="cc-batch-group">
                <span className="cc-batch-label">주기</span>
                <select className="cc-batch-select" value={batchSchedule.cycle} onChange={e => updateBatch("cycle", e.target.value)}>
                  {["매일", "매주", "매달"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              {batchSchedule.cycle === "매주" && (
                <div className="cc-batch-group">
                  <span className="cc-batch-label">요일</span>
                  <select className="cc-batch-select" value={batchSchedule.dayOfWeek} onChange={e => updateBatch("dayOfWeek", e.target.value)}>
                    {["월", "화", "수", "목", "금", "토", "일"].map(d => <option key={d} value={d}>{d}요일</option>)}
                  </select>
                </div>
              )}
              {batchSchedule.cycle === "매달" && (
                <div className="cc-batch-group">
                  <span className="cc-batch-label">날짜</span>
                  <select className="cc-batch-select" value={batchSchedule.dayOfMonth} onChange={e => updateBatch("dayOfMonth", e.target.value)}>
                    {Array.from({ length: 31 }, (_, i) => String(i + 1)).map(d => <option key={d} value={d}>{d}일</option>)}
                  </select>
                </div>
              )}
              <div className="cc-batch-group">
                <span className="cc-batch-label">시</span>
                <select className="cc-batch-select" value={batchSchedule.hour} onChange={e => updateBatch("hour", e.target.value)}>
                  {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h}시</option>)}
                </select>
              </div>
              <div className="cc-batch-group">
                <span className="cc-batch-label">분</span>
                <select className="cc-batch-select" value={batchSchedule.minute} onChange={e => updateBatch("minute", e.target.value)}>
                  {MINUTE_OPTIONS.map(m => <option key={m} value={m}>{m}분</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {saveError && <div className="cc-save-error">{saveError}</div>}

        <div className="cc-footer-btns">
          <button className="cc-btn-cancel" onClick={() => onNavigate && onNavigate("list")} disabled={saving}>취소</button>
          <button className="cc-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? "저장 중..." : "✓ 저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}