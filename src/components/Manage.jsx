import React, { useState, useEffect, useCallback } from "react";
import { listMyMandalarts, createMandalart, deleteMandalart } from "../api/mandalartsApi";

export default function Manage({ pal, t, myId, onOpen }) {
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontWeight: 900, fontSize: 24, textTransform: "uppercase", margin: 0, color: pal.ink }}>{t.manage.title}</h2>
        <button onClick={create} style={{ background: pal.accent3, color: "#1a1a1a", border: "none", padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          {t.manage.create}
        </button>
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
