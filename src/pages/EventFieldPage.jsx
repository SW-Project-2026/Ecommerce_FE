import { useState, useEffect } from "react";
import "./EventFieldPage.css";
import { eventList, addEventField, updateEventField, deleteEventField } from "../api/events";

const TYPE_OPTIONS     = ["STRING", "NUMBER", "DATETIME", "DATE", "TIME"];
const REQUIRED_OPTIONS = ["필수", "선택"];

/* ── 이벤트 그룹 ── */
function EventGroup({ event, onReload }) {
  const [showAddRow,  setShowAddRow]  = useState(false);
  const [editFieldId, setEditFieldId] = useState(null);
  const [newField,    setNewField]    = useState({ key: "", type: "STRING", required: "필수", desc: "" });
  const [editField,   setEditField]   = useState({});
  const [saving,      setSaving]      = useState(false);
  const [deleting,    setDeleting]    = useState(null);

  const handleAdd = async () => {
    if (!newField.key.trim()) return;
    setSaving(true);
    try {
      await addEventField(event.eventId, {
        fieldName:   newField.key,
        fieldType:   newField.type,
        isRequired:  newField.required === "필수",
        description: newField.desc,
      });
      setNewField({ key: "", type: "STRING", required: "필수", desc: "" });
      setShowAddRow(false);
      onReload();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditStart = (f) => {
    setEditFieldId(f.fieldId);
    setEditField({
      fieldName:   f.fieldName,
      fieldType:   f.fieldType,
      isRequired:  f.isRequired ? "필수" : "선택",
      description: f.description ?? "",
    });
  };

  const handleEditSave = async (fieldId) => {
    setSaving(true);
    try {
      await updateEventField(event.eventId, fieldId, {
        fieldName:   editField.fieldName,
        fieldType:   editField.fieldType,
        isRequired:  editField.isRequired === "필수",
        description: editField.description,
      });
      setEditFieldId(null);
      onReload();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (fieldId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    setDeleting(fieldId);
    try {
      await deleteEventField(event.eventId, fieldId);
      onReload();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="ef-group">
      <div className="ef-group-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h3 className="ef-event-title">
            <span className="ef-event-key">{event.eventName}</span>
            <span className="ef-event-sep"> | </span>
            <span>{event.description}</span>
          </h3>
        </div>
        <span style={{
          display: "inline-block",
          padding: "2px 10px",
          borderRadius: "10px",
          fontSize: 11,
          fontFamily: "'Noto Sans KR', sans-serif",
          fontWeight: 500,
          background: event.isActive ? "rgba(34,197,94,0.12)" : "rgba(158,166,181,0.15)",
          color: event.isActive ? "#1a9e42" : "#9EA6B5",
        }}>
          {event.isActive ? "활성" : "비활성"}
        </span>
      </div>

      <table className="ef-table">
        <thead>
          <tr>
            <th>필드명 (key)</th>
            <th>타입</th>
            <th>필수여부</th>
            <th>설명</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {event.fields && event.fields.length > 0 ? (
            event.fields.map((f) => (
              <tr key={f.fieldId}>
                {editFieldId === f.fieldId ? (
                  <>
                    <td>
                      <input
                        className="ef-add-input ef-add-input-key"
                        value={editField.fieldName}
                        onChange={(e) => setEditField({ ...editField, fieldName: e.target.value })}
                      />
                    </td>
                    <td>
                      <div className="ef-add-select-wrap">
                        <select
                          className="ef-add-select"
                          value={editField.fieldType}
                          onChange={(e) => setEditField({ ...editField, fieldType: e.target.value })}
                        >
                          {TYPE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </td>
                    <td>
                      <div className="ef-add-select-wrap">
                        <select
                          className="ef-add-select"
                          value={editField.isRequired}
                          onChange={(e) => setEditField({ ...editField, isRequired: e.target.value })}
                        >
                          {REQUIRED_OPTIONS.map((r) => <option key={r}>{r}</option>)}
                        </select>
                      </div>
                    </td>
                    <td>
                      <input
                        className="ef-add-input ef-add-input-desc"
                        value={editField.description}
                        onChange={(e) => setEditField({ ...editField, description: e.target.value })}
                      />
                    </td>
                    <td>
                      <div className="ef-add-actions">
                        <button className="ef-btn-add-confirm" onClick={() => handleEditSave(f.fieldId)} disabled={saving}>저장</button>
                        <button className="ef-btn-add-cancel" onClick={() => setEditFieldId(null)}>취소</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="ef-td-key">{f.fieldName}</td>
                    <td className="ef-td-type">{f.fieldType}</td>
                    <td className="ef-td-req">{f.isRequired ? "필수" : "선택"}</td>
                    <td className="ef-td-desc">{f.description}</td>
                    <td className="ef-td-action">
                      <div className="ef-add-actions">
                        <button className="ef-btn-edit" onClick={() => handleEditStart(f)}>수정</button>
                        <button
                          className="ef-btn-add-cancel"
                          onClick={() => handleDelete(f.fieldId)}
                          disabled={deleting === f.fieldId}
                        >
                          {deleting === f.fieldId ? "삭제중..." : "삭제"}
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", color: "#999", padding: "16px" }}>
                필드가 없습니다
              </td>
            </tr>
          )}

          {showAddRow && (
            <tr className="ef-add-row">
              <td>
                <input
                  className="ef-add-input ef-add-input-key"
                  placeholder="필드명 (key)"
                  value={newField.key}
                  onChange={(e) => setNewField({ ...newField, key: e.target.value })}
                />
              </td>
              <td>
                <div className="ef-add-select-wrap">
                  <select
                    className="ef-add-select"
                    value={newField.type}
                    onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                  >
                    {TYPE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </td>
              <td>
                <div className="ef-add-select-wrap">
                  <select
                    className="ef-add-select"
                    value={newField.required}
                    onChange={(e) => setNewField({ ...newField, required: e.target.value })}
                  >
                    {REQUIRED_OPTIONS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </td>
              <td>
                <input
                  className="ef-add-input ef-add-input-desc"
                  placeholder="설명 입력"
                  value={newField.desc}
                  onChange={(e) => setNewField({ ...newField, desc: e.target.value })}
                />
              </td>
              <td>
                <div className="ef-add-actions">
                  <button className="ef-btn-add-confirm" onClick={handleAdd} disabled={saving}>
                    {saving ? "추가중..." : "추가"}
                  </button>
                  <button className="ef-btn-add-cancel" onClick={() => setShowAddRow(false)}>취소</button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {!showAddRow && (
        <div className="ef-group-footer">
          <button className="ef-btn-add-field" onClick={() => setShowAddRow(true)}>
            필드 추가하기 +
          </button>
        </div>
      )}
    </div>
  );
}

/* ── 메인 페이지 ── */
export default function EventFieldPage() {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetchEvents = () => {
    setLoading(true);
    setError(null);
    eventList()
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="ef-main">
      <div className="ef-page-header">
        <div>
          <h1 className="ef-page-title">이벤트 연동 필드 설정</h1>
          <p className="ef-page-sub">이벤트별 수집 필드 정의 및 필수여부 관리</p>
        </div>
      </div>

      <div className="ef-content">
        {loading && (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            불러오는 중...
          </div>
        )}
        {!loading && error && (
          <div style={{ textAlign: "center", padding: "40px", color: "#e53e3e" }}>
            {error}
          </div>
        )}
        {!loading && !error && events.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            이벤트가 없습니다
          </div>
        )}
        {!loading && !error && events.map((event) => (
          <EventGroup
            key={event.eventId}
            event={event}
            onReload={fetchEvents}
          />
        ))}
      </div>
    </div>
  );
}