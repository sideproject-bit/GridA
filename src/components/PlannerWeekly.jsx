import { useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useViewport } from "../hooks/useViewport";

const COLS_DAY  = 6;    // 10-min slots per hour (compatible with PlannerDaily)
const HOURS     = 24;
const CELL_H    = 22;   // px per hour row
const LABEL_W   = 32;   // px for time-label column
const DAY_MIN_W = 56;   // min px per day column (mobile horizontal scroll)

const MON = { red: "#C7382E", blue: "#2B3DCB", yellow: "#E3B22E" };

function localKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getWeekMonday(d) {
  const r = new Date(d);
  const day = r.getDay();
  r.setDate(r.getDate() + (day === 0 ? -6 : 1 - day));
  r.setHours(0, 0, 0, 0);
  return r;
}

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function fmtShort(d, lang) {
  return d.toLocaleDateString(lang === "ko" ? "ko-KR" : "en-US", { month: "short", day: "numeric" });
}

function fmtDow(d, lang) {
  return d.toLocaleDateString(lang === "ko" ? "ko-KR" : "en-US", { weekday: "short" });
}

function cellToTime(cell) {
  const h = Math.floor(cell / COLS_DAY);
  const m = (cell % COLS_DAY) * 10;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function cellToTimeEnd(cell) {
  const total = Math.floor(cell / COLS_DAY) * 60 + (cell % COLS_DAY) * 10 + 10;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

const EVENT_COLORS = ["#FFAAAA", "#FFE599", "#AAD4FF", "#C7382E", "#C8960A", "#1A2A9E"];

export default function PlannerWeekly({ t, pal, dark, calEvents, recurring, onEditDailyEvent, onEditCalEvent, theme, lang }) {
  const pl  = t.planner;
  const wk  = pl.weekly ?? {};
  const { isMobile } = useViewport();
  const isMon = theme === "mondrian";
  const ink   = pal.ink;
  const acc   = pal.accent;
  const bg    = pal.bg;
  const border = dark ? "#2a2920" : "#e0ddd2";

  const [weekStart, setWeekStart] = useState(() => getWeekMonday(new Date()));
  const [viewEvt,  setViewEvt]  = useState(null); // { event, dateKey }
  const [isEditingView, setIsEditingView] = useState(false);
  const [editTitle,   setEditTitle]   = useState("");
  const [editColor,   setEditColor]   = useState(EVENT_COLORS[0]);
  const [editMemo,    setEditMemo]    = useState("");

  const days    = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dayKeys = days.map(localKey);
  const today   = localKey(new Date());
  const totalH  = HOURS * CELL_H;

  function openEditEvt(evt) {
    setEditTitle(evt.title);
    setEditColor(evt.color);
    setEditMemo(evt.memo ?? "");
    setIsEditingView(true);
  }

  function saveEditEvt() {
    if (!viewEvt || !editTitle.trim()) return;
    const changes = { title: editTitle.trim(), color: editColor, memo: editMemo };
    if (viewEvt.event._daily) {
      onEditDailyEvent?.(viewEvt.event.id, changes);
    } else {
      onEditCalEvent?.(viewEvt.dateKey, viewEvt.event.id, changes);
    }
    setViewEvt(null);
    setIsEditingView(false);
  }

  function getEventsForDay(day, dateKey) {
    const dow  = day.getDay();
    const cal  = (calEvents[dateKey] ?? []).map(e => ({ ...e, _dateKey: dateKey }));
    const recur = recurring
      .filter(r => r.days.includes(dow))
      .map(r => ({ ...r, id: `recur_${r.id}_${dateKey}`, fromCalendar: true, _dateKey: dateKey }));
    return [...cal, ...recur];
  }


  const weekLabel = `${fmtShort(weekStart, lang)} – ${fmtShort(addDays(weekStart, 6), lang)}`;
  const todayAccent = MON.yellow; // today column always yellow

  return (
    <div style={{ color: ink, fontFamily: "inherit" }}>
      {/* Week navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button onClick={() => setWeekStart(d => addDays(d, -7))}
          style={{ background: "none", border: `1px solid ${ink}33`, color: ink, cursor: "pointer", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ChevronLeft size={15} />
        </button>
        <span style={{ fontWeight: 800, fontSize: 13, flex: 1, textAlign: "center", letterSpacing: "-0.01em" }}>{weekLabel}</span>
        <button onClick={() => setWeekStart(d => addDays(d, 7))}
          style={{ background: "none", border: `1px solid ${ink}33`, color: ink, cursor: "pointer", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ChevronRight size={15} />
        </button>
        <button onClick={() => setWeekStart(getWeekMonday(new Date()))}
          style={{ background: "none", border: `1px solid ${ink}33`, color: ink, cursor: "pointer", fontSize: 10, fontWeight: 700, padding: "5px 8px", textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0, whiteSpace: "nowrap" }}>
          {wk.today || (lang === "ko" ? "이번 주" : "This week")}
        </button>
      </div>

      {/* Scrollable grid wrapper */}
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ minWidth: LABEL_W + DAY_MIN_W * 7 }}>

          {/* Day-of-week headers */}
          <div style={{ display: "flex", borderBottom: `2px solid ${ink}22`, marginLeft: LABEL_W, paddingLeft: 0 }}>
            {days.map((day, i) => {
              const isToday = dayKeys[i] === today;
              return (
                <div key={i} style={{
                  flex: 1, minWidth: DAY_MIN_W,
                  padding: "5px 2px 4px",
                  textAlign: "center",
                  background: isToday ? todayAccent : "transparent",
                  borderLeft: i > 0 ? `1px solid ${border}` : "none",
                }}>
                  <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", color: isToday ? "#1a1a1a" : ink, opacity: isToday ? 1 : 0.45, letterSpacing: "0.06em" }}>
                    {fmtDow(day, lang)}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: isToday ? "#1a1a1a" : ink, lineHeight: 1.2 }}>
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time grid */}
          <div style={{ display: "flex", position: "relative" }}>

            {/* Hour labels */}
            <div style={{ width: LABEL_W, flexShrink: 0, height: totalH, position: "relative" }}>
              {Array.from({ length: HOURS }, (_, h) => (
                <div key={h} style={{
                  position: "absolute", top: h * CELL_H, left: 0, right: 0, height: CELL_H,
                  fontSize: 9, fontWeight: 600, textAlign: "right", paddingRight: 4,
                  opacity: 0.35, lineHeight: `${CELL_H}px`, fontVariantNumeric: "tabular-nums",
                  borderBottom: `1px solid ${border}`,
                  color: ink,
                }}>
                  {h % 2 === 0 ? String(h).padStart(2, "0") : ""}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((day, di) => {
              const dateKey = dayKeys[di];
              const evts = getEventsForDay(day, dateKey);
              const isToday = dateKey === today;

              return (
                <div key={di} style={{
                  flex: 1, minWidth: DAY_MIN_W, height: totalH, position: "relative",
                  borderLeft: `1px solid ${border}`,
                  background: isToday ? (dark ? `${todayAccent}10` : `${todayAccent}08`) : "transparent",
                }}>
                  {/* Hour grid lines */}
                  {Array.from({ length: HOURS }, (_, h) => (
                    <div key={h}
                      style={{
                        position: "absolute", top: h * CELL_H, left: 0, right: 0, height: CELL_H,
                        borderBottom: `1px solid ${h % 2 === 1 ? border : border + "88"}`,
                        zIndex: 0,
                      }}
                    />
                  ))}

                  {/* Events */}
                  {evts.map(evt => {
                    const startH = Math.floor(evt.startCell / COLS_DAY);
                    const endH   = Math.min(HOURS - 1, Math.floor(evt.endCell / COLS_DAY));
                    const topPx  = startH * CELL_H + 1;
                    const htPx   = Math.max(CELL_H - 2, (endH - startH + 1) * CELL_H - 2);
                    return (
                      <div key={evt.id}
                        onClick={(e) => { e.stopPropagation(); setViewEvt({ event: evt, dateKey }); }}
                        style={{
                          position: "absolute", top: topPx, left: 1, right: 1, height: htPx,
                          background: evt.color + "cc",
                          borderLeft: `2px solid ${evt.color}`,
                          borderRadius: 2, padding: "1px 3px",
                          overflow: "hidden", zIndex: 1,
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ fontSize: 9, fontWeight: 700, lineHeight: 1.3, color: dark ? "#fff" : "#111", overflow: "hidden" }}>
                          {evt.title}
                        </div>
                        {htPx > CELL_H && (
                          <div style={{ fontSize: 8, opacity: 0.7, color: dark ? "#fff" : "#111" }}>
                            {cellToTime(evt.startCell)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event detail popup */}
      {viewEvt && createPortal((
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.45)" }} onClick={() => { setViewEvt(null); setIsEditingView(false); }} />
          <div style={{
            position: "fixed",
            left: isMobile ? 14 : "50%", right: isMobile ? 14 : "auto",
            top: isMobile ? 16 : "50%",
            transform: isMobile ? "none" : "translate(-50%, -50%)",
            zIndex: 51, width: isMobile ? "auto" : 300,
            background: bg, color: ink,
            border: `2px solid ${isEditingView ? editColor : viewEvt.event.color}`, borderRadius: 10, padding: 20,
            boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
          }}>
            {isEditingView ? (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.45, marginBottom: 10, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  {viewEvt.dateKey} · {cellToTime(viewEvt.event.startCell)} – {cellToTimeEnd(viewEvt.event.endCell)}
                </div>
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && saveEditEvt()}
                  autoFocus
                  style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", fontSize: 13, fontFamily: "inherit", border: `1px solid ${dark ? "#444" : "#ccc"}`, borderRadius: 6, background: dark ? "#1e1d16" : "#fff", color: ink, outline: "none", marginBottom: 10 }}
                />
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  {EVENT_COLORS.map(c => (
                    <div key={c} onClick={() => setEditColor(c)} style={{ width: 22, height: 22, borderRadius: 4, background: c, cursor: "pointer", flexShrink: 0, outline: editColor === c ? `2.5px solid ${ink}` : "none", outlineOffset: 2 }} />
                  ))}
                </div>
                <textarea
                  value={editMemo}
                  onChange={e => setEditMemo(e.target.value)}
                  placeholder={pl.eventMemoPlaceholder}
                  rows={2}
                  style={{ width: "100%", boxSizing: "border-box", padding: "7px 10px", fontSize: 12, fontFamily: "inherit", border: `1px solid ${dark ? "#444" : "#ccc"}`, borderRadius: 6, background: dark ? "#1e1d16" : "#fff", color: ink, outline: "none", resize: "none", marginBottom: 12 }}
                />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button onClick={() => setIsEditingView(false)} style={{ background: "none", border: `1px solid ${dark ? "#444" : "#ccc"}`, borderRadius: 6, padding: "6px 13px", fontSize: 12, cursor: "pointer", color: ink, fontFamily: "inherit" }}>
                    {pl.cancel}
                  </button>
                  <button onClick={saveEditEvt} disabled={!editTitle.trim()} style={{ background: acc, color: "#fff", border: "none", borderRadius: 6, padding: "6px 13px", fontSize: 12, cursor: editTitle.trim() ? "pointer" : "not-allowed", fontWeight: 700, fontFamily: "inherit", opacity: editTitle.trim() ? 1 : 0.4 }}>
                    {pl.saveChanges || "Save"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: viewEvt.event.color, flexShrink: 0 }} />
                  <div style={{ fontWeight: 800, fontSize: 15, wordBreak: "keep-all" }}>{viewEvt.event.title}</div>
                </div>
                <div style={{ fontSize: 11, opacity: 0.45, marginBottom: 6 }}>
                  {viewEvt.dateKey} · {cellToTime(viewEvt.event.startCell)} – {cellToTimeEnd(viewEvt.event.endCell)}
                </div>
                {viewEvt.event.memo && (
                  <div style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.8, wordBreak: "keep-all", whiteSpace: "pre-wrap", marginBottom: 8 }}>
                    {viewEvt.event.memo}
                  </div>
                )}
                {viewEvt.event.fromCalendar && (
                  <div style={{ fontSize: 10, opacity: 0.35, marginBottom: 8 }}>📅 {pl.fromCalendar}</div>
                )}
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                  {!viewEvt.event.id.startsWith("recur_") && (
                    <button onClick={() => openEditEvt(viewEvt.event)}
                      style={{ background: acc, color: "#fff", border: "none", borderRadius: 6, padding: "6px 13px", fontSize: 12, cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>
                      {pl.edit || "Edit"}
                    </button>
                  )}
                  <button onClick={() => setViewEvt(null)}
                    style={{ background: "none", border: `1px solid ${dark ? "#444" : "#ccc"}`, color: ink, borderRadius: 6, padding: "6px 13px", fontSize: 12, cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>
                    {pl.cancel}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      ), document.body)}
    </div>
  );
}
