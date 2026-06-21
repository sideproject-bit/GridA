import React, { useState } from "react";
import { X } from "lucide-react";

export default function DescriptionEditor({ value, onSave, onClose, pal, t, play, readOnly = false }) {
  const [text, setText] = useState(value || "");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }}>
      <div style={{ width: 340, maxWidth: "90vw", background: pal.bg, color: pal.ink, border: `3px solid ${pal.accent}`, padding: 22, position: "relative" }} className="fade-in">
        <button onClick={onClose} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", color: pal.ink, cursor: "pointer" }}>
          <X size={16} />
        </button>
        <h4 style={{ fontWeight: 900, fontSize: 14, textTransform: "uppercase", margin: "0 0 10px" }}>{readOnly ? t.grid.descViewTitle : t.grid.descTitle}</h4>
        <textarea
          autoFocus={!readOnly}
          value={text}
          onChange={(e) => !readOnly && setText(e.target.value)}
          readOnly={readOnly}
          placeholder={t.grid.descPlaceholder}
          rows={4}
          style={{
            width: "100%", background: pal.accent + "0F", border: `1px solid ${pal.ink}30`, color: pal.ink,
            padding: 10, fontSize: 12.5, resize: "vertical", outline: "none", opacity: readOnly ? 0.85 : 1,
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
          {readOnly ? (
            <button onClick={onClose} style={{ background: pal.accent, color: "#fff", border: "none", padding: "7px 16px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
              {t.grid.descClose}
            </button>
          ) : (
            <>
              <button onClick={onClose} style={{ background: "none", border: "none", color: pal.ink, opacity: 0.6, cursor: "pointer", fontSize: 12 }}>
                {t.grid.descCancel}
              </button>
              <button
                onClick={() => { onSave(text); play("G5", "16n"); onClose(); }}
                style={{ background: pal.accent, color: "#fff", border: "none", padding: "7px 16px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
              >
                {t.grid.descSave}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
