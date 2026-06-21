import React, { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { listFriendMandalarts } from "../api/mandalartsApi";

export default function FriendMandalartList({ friend, pal, t, onOpen }) {
  const [items, setItems] = useState(null); // null = loading

  useEffect(() => {
    if (!friend) return;
    listFriendMandalarts(friend.id).then(setItems);
  }, [friend]);

  return (
    <div>
      <h2 style={{ fontWeight: 900, fontSize: 24, textTransform: "uppercase", marginBottom: 16, color: pal.ink }}>
        {t.friends.viewerListTitle(friend?.code ?? "")}
      </h2>
      {items === null ? (
        <p style={{ fontSize: 12, opacity: 0.6, color: pal.ink }}>{t.loading}</p>
      ) : items.length === 0 ? (
        <p style={{ fontSize: 12, opacity: 0.6, color: pal.ink }}>{t.friends.viewerEmpty}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((m) => (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${pal.ink}30`, padding: "14px 16px", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: pal.ink }}>{m.title}</span>
              <button
                onClick={() => onOpen(m)}
                style={{ background: pal.accent, color: "#fff", border: "none", padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
              >
                <Eye size={13} /> {t.friends.viewerOpen}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
