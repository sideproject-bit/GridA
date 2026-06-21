import React, { useState, useEffect, useRef } from "react";
import { Link2, StickyNote, CheckCircle2 } from "lucide-react";

export default function Cell({
  r, c, value, isMain, isHeader, isOuterCenter, onChange, onLink,
  description, onOpenDesc, completed = false, onToggleCompleted,
  pal, t, highlighted, size = "normal", readOnly = false,
}) {
  const [editing, setEditing] = useState(false);
  const taRef = useRef(null);
  const originalRef = useRef(value);
  const placeholder = isMain ? t.grid.mainGoal : isHeader || isOuterCenter ? t.grid.subGoal : t.grid.detail;
  const isDetail = !isMain && !isHeader && !isOuterCenter;
  const showNote = isDetail && (description || !readOnly);

  useEffect(() => {
    if (editing && taRef.current) {
      taRef.current.style.height = "auto";
      taRef.current.style.height = taRef.current.scrollHeight + "px";
    }
  }, [editing, value]);

  const startEditing = () => {
    if (readOnly) return;
    originalRef.current = value;
    setEditing(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onChange(r, c, originalRef.current);
      setEditing(false);
      e.currentTarget.blur();
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setEditing(false);
      e.currentTarget.blur();
    }
  };

  const big = size === "large";
  const isMondrian = pal.accent !== pal.accent3;

  const bg = isMain
    ? pal.accent
    : isHeader || isOuterCenter
    ? pal.accent2 + "44"
    : completed
    ? (isMondrian ? "rgba(242,237,225,0.28)" : pal.accent3 + "42")
    : pal.accent3 + "18";

  const border = isMain
    ? `2px solid ${pal.accent}`
    : isHeader || isOuterCenter
    ? `1px solid ${pal.accent2}66`
    : completed
    ? (isMondrian ? "1px solid rgba(242,237,225,0.5)" : `1px solid ${pal.accent3}60`)
    : `1px solid ${pal.accent3}30`;

  return (
    <div
      className={highlighted ? "cell-pulse" : ""}
      style={{
        position: "relative",
        background: bg,
        border,
        color: isMain ? "#fff" : pal.ink,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: big ? 8 : 4,
        minHeight: big ? 110 : "100%",
        height: big ? undefined : "100%",
        boxSizing: "border-box",
        cursor: readOnly ? "default" : "text",
      }}
      onClick={startEditing}
    >
      {editing ? (
        <textarea
          ref={taRef}
          autoFocus
          value={value}
          onChange={(e) => onChange(r, c, e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setEditing(false)}
          rows={1}
          style={{
            width: "100%",
            background: "transparent",
            color: "inherit",
            border: "none",
            outline: "none",
            resize: "none",
            textAlign: "center",
            font: "inherit",
            fontWeight: isMain ? 800 : 500,
            fontSize: big ? (isMain ? 15 : 13) : (isMain ? 12 : 11),
            overflow: "hidden",
          }}
        />
      ) : (
        <span
          style={{
            fontSize: big ? (isMain ? 15 : 13) : (isMain ? 12 : 11),
            fontWeight: isMain ? 800 : 500,
            textTransform: isMain ? "uppercase" : "none",
            opacity: value ? 1 : 0.4,
            textAlign: "center",
            wordBreak: "break-word",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: big ? 5 : 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {value || placeholder}
        </span>
      )}

      {(isHeader || isOuterCenter) && (
        <button
          aria-label="link"
          onClick={(e) => {
            e.stopPropagation();
            onLink(r, c);
          }}
          style={{
            position: "absolute", top: 2, right: 2, background: "none", border: "none",
            color: pal.ink, opacity: 0.45, cursor: "pointer", padding: big ? 4 : 2,
          }}
        >
          <Link2 size={big ? 13 : 11} />
        </button>
      )}

      {isDetail && description && (
        <span
          title={description}
          style={{
            position: "absolute", top: 4, right: 4, width: 5, height: 5,
            borderRadius: "50%", background: pal.accent,
          }}
        />
      )}

      {isDetail && showNote && (
        <button
          aria-label="note"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDesc(r, c);
          }}
          style={{
            position: "absolute", bottom: 2, right: big ? 22 : 18, background: "none", border: "none",
            color: pal.ink, opacity: description ? 0.6 : 0.3, cursor: "pointer", padding: big ? 4 : 2,
          }}
        >
          <StickyNote size={big ? 13 : 10} />
        </button>
      )}

      {isDetail && !readOnly && (
        <button
          aria-label={completed ? "uncheck" : "check"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompleted?.(r, c);
          }}
          style={{
            position: "absolute", bottom: 2, right: 2, background: "none", border: "none",
            color: completed ? pal.accent : pal.ink,
            opacity: completed ? 0.9 : 0.25,
            cursor: "pointer", padding: big ? 4 : 2,
            transition: "opacity 0.15s ease, color 0.15s ease",
          }}
        >
          <CheckCircle2 size={big ? 14 : 11} />
        </button>
      )}
    </div>
  );
}
