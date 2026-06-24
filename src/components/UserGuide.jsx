import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import ContactPanel from "./ContactPanel";

export default function UserGuide({ pal, t }) {
  const [open, setOpen]  = useState(null);
  const [tab, setTab]    = useState("guide");
  const items = t.guide.items;
  const acc = pal.accent2;
  const ink = pal.ink;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: 0, marginBottom: 18, borderBottom: `1px solid ${ink}20` }}>
        {[["guide", t.guide.tabGuide], ["contact", t.guide.tabContact], ["terms", t.guide.tabTerms]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            background: "none", border: "none",
            borderBottom: tab === key ? `2px solid ${acc}` : "2px solid transparent",
            color: tab === key ? acc : ink, opacity: tab === key ? 1 : 0.5,
            padding: "8px 16px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "guide" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {items.map((item, i) => (
              <div key={i}>
                <button onClick={() => setOpen(open === i ? null : i)} style={{
                  width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: open === i ? acc + "18" : "none",
                  border: `1px solid ${ink}20`,
                  padding: "11px 14px", cursor: "pointer", color: ink, textAlign: "left",
                }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{item.t}</span>
                  <ChevronRight size={14} style={{ flexShrink: 0, transform: open === i ? "rotate(90deg)" : "none", transition: "transform 0.18s ease" }} />
                </button>
                {open === i && (
                  <div style={{
                    padding: "12px 14px",
                    background: acc + "0a",
                    borderLeft: `3px solid ${acc}`,
                    fontSize: 13, lineHeight: 1.75, color: ink, opacity: 0.85,
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
            <h3 style={{ fontWeight: 800, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 16px", color: ink }}>
              {t.auth.termsTitle}
            </h3>
            <ol style={{ margin: 0, padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: 12 }}>
              {t.auth.termsClauses.map((clause, i) => (
                <li key={i} style={{ fontSize: 13, lineHeight: 1.75, color: ink, opacity: 0.8 }}>{clause}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
