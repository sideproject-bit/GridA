import React from "react";
import { createPortal } from "react-dom";
import { X, Bell } from "lucide-react";

export default function NotificationBanner({ banner, pal, onDismiss }) {
  if (!banner) return null;
  return createPortal(
    <>
      <style>{`
        @keyframes notifSlideDown { from { opacity:0; transform:translateY(-16px); } to { opacity:1; transform:none; } }
      `}</style>
      <div style={{
        position: "fixed",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(480px, calc(100vw - 32px))",
        zIndex: 9999,
        background: pal.ink, color: pal.bg,
        padding: "12px 14px",
        display: "flex", alignItems: "flex-start", gap: 10,
        boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
        animation: "notifSlideDown 0.3s cubic-bezier(0.22,1,0.36,1)",
        borderRadius: 6,
      }}>
        <Bell size={15} color={pal.bg} style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 13 }}>{banner.title}</div>
          {banner.body && <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2, lineHeight: 1.4 }}>{banner.body}</div>}
        </div>
        <button onClick={onDismiss} style={{ background: "none", border: "none", color: pal.bg, cursor: "pointer", opacity: 0.6, padding: 2, flexShrink: 0, display: "flex" }}>
          <X size={15} />
        </button>
      </div>
    </>,
    document.body
  );
}
