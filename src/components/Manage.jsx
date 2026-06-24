import React, { useState, useEffect, useCallback } from "react";
import { BookOpen, HelpCircle } from "lucide-react";
import { listMyMandalarts, createMandalart, deleteMandalart } from "../api/mandalartsApi";
import { useViewport } from "../hooks/useViewport";

export default function Manage({ pal, t, myId, onOpen, onAbout }) {
  const { isMobile } = useViewport();
  const [items, setItems] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const refresh = useCallback(() => {
    listMyMandalarts(myId).then(setItems);
  }, [myId]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = async () => {
    const m = await createMandalart(myId, t.grid.untitled);
    if (m) onOpen(m.id);
  };

  const handleDelete = async (id) => {
    await deleteMandalart(id);
    setConfirmId(null);
    refresh();
  };

  return (
    <div>
      {/* Mandalart about banner — desktop only (mobile gets a button next to New) */}
      {!isMobile && (
      <button onClick={onAbout} style={{
        display: "flex", alignItems: "center", gap: 14,
        width: "100%", marginBottom: 20, padding: "16px 20px",
        background: pal.accent + "10", border: `2px solid ${pal.accent}30`,
        cursor: "pointer", textAlign: "left", color: pal.ink,
        fontFamily: "inherit",
      }}>
        <div style={{
          flexShrink: 0, width: 36, height: 36,
          background: pal.accent, display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 3,
        }}>
          <BookOpen size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {t.mandalartAbout.btn}
          </div>
          <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>
            {t.mandalartAbout.body[0].slice(0, 60)}…
          </div>
        </div>
      </button>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontWeight: 900, fontSize: 24, textTransform: "uppercase", margin: 0, color: pal.ink }}>{t.manage.title}</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {isMobile && (
            <button onClick={onAbout} style={{ background: "none", color: pal.ink, border: `1px solid ${pal.accent}55`, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <HelpCircle size={13} /> {t.mandalartAbout.btn}
            </button>
          )}
          <button onClick={create} style={{ background: pal.accent3, color: "#1a1a1a", border: "none", padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {t.manage.create}
          </button>
        </div>
      </div>
      {items === null ? (
        <p style={{ fontSize: 12, opacity: 0.6, color: pal.ink }}>{t.loading}</p>
      ) : items.length === 0 ? (
        <p style={{ fontSize: 12, opacity: 0.6, color: pal.ink }}>{t.manage.empty}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((m) => (
            <div key={m.id} style={{ border: `1px solid ${pal.ink}30`, padding: "14px 16px" }}>
              {confirmId === m.id ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <span style={{ fontSize: 12, color: pal.ink, opacity: 0.8 }}>{t.manage.deleteConfirm}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleDelete(m.id)} style={{ background: "#C7382E", color: "#fff", border: "none", padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                      {t.manage.deleteYes}
                    </button>
                    <button onClick={() => setConfirmId(null)} style={{ background: "none", border: `1px solid ${pal.ink}40`, color: pal.ink, padding: "6px 14px", fontSize: 11, cursor: "pointer" }}>
                      {t.manage.deleteNo}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: pal.ink }}>{m.title}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => onOpen(m.id)} style={{ background: pal.accent2, color: "#fff", border: "none", padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                      {t.manage.open}
                    </button>
                    <button onClick={() => setConfirmId(m.id)} style={{ background: "#C7382E", color: "#fff", border: "none", padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                      {t.manage.delete}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
