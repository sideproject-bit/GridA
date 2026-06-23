import React, { useState } from "react";
import { X, ChevronRight } from "lucide-react";
import ContactPanel from "./ContactPanel";

export default function FeatureGuide({ pal, t, onClose }) {
  const [open, setOpen] = useState(null);
  const [tab, setTab] = useState("guide");
  const items = t.guide.items;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }}>
      <div
        className="fade-in"
        style={{
          width: 480, maxWidth: "92vw", maxHeight: "80vh",
          background: pal.bg, color: pal.ink,
          border: `3px solid ${pal.accent2}`,
          padding: 28, overflowY: "auto", position: "relative",
        }}
      >
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: pal.ink, cursor: "pointer" }}>
          <X size={18} />
        </button>
        <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: `1px solid ${pal.ink}20` }}>
          {[["guide", t.guide.tabGuide], ["contact", t.guide.tabContact], ["terms", t.guide.tabTerms]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                background: "none", border: "none", borderBottom: tab === key ? `2px solid ${pal.accent2}` : "2px solid transparent",
                color: tab === key ? pal.accent2 : pal.ink, opacity: tab === key ? 1 : 0.5,
                padding: "8px 16px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer",
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "guide" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {items.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: open === i ? pal.accent2 + "18" : "none",
                    border: `1px solid ${pal.ink}20`,
                    padding: "11px 14px", cursor: "pointer", color: pal.ink, textAlign: "left",
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{item.t}</span>
                  <ChevronRight
                    size={14}
                    style={{ flexShrink: 0, transform: open === i ? "rotate(90deg)" : "none", transition: "transform 0.18s ease" }}
                  />
                </button>
                {open === i && (
                  <div style={{
                    padding: "12px 14px",
                    background: pal.accent2 + "0a",
                    borderLeft: `3px solid ${pal.accent2}`,
                    fontSize: 13, lineHeight: 1.75, color: pal.ink, opacity: 0.85,
                  }}>
                    {item.b}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : tab === "contact" ? (
          <ContactPanel pal={pal} t={t} />
        ) : (
          <div>
            <h3 style={{ fontWeight: 800, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 16px", color: pal.ink }}>
              {t.termsTitle}
            </h3>
            <ol style={{ margin: 0, padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: 12 }}>
              {t.termsClauses.map((clause, i) => (
                <li key={i} style={{ fontSize: 13, lineHeight: 1.75, color: pal.ink, opacity: 0.8 }}>{clause}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
