import React, { useState, useEffect } from "react";
import { getAllContactMessages, replyToContactMessage } from "../api/contactApi";

export default function AdminPanel({ pal, dark }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("all"); // "all" | "pending" | "replied"

  const [loadError, setLoadError] = useState(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await getAllContactMessages();
    if (error) {
      console.error("AdminPanel load error:", error);
      setLoadError(error.message ?? JSON.stringify(error));
    }
    setMessages(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleReply = async (id) => {
    if (!replyText.trim()) return;
    setSending(true);
    const { error } = await replyToContactMessage(id, replyText.trim());
    if (!error) {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: "replied", admin_reply: replyText.trim(), replied_at: new Date().toISOString() } : m));
      setReplyingId(null);
      setReplyText("");
    }
    setSending(false);
  };

  const filtered = filter === "all" ? messages : messages.filter(m => m.status === filter);

  const fmtDate = (d) => d ? new Date(d).toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontWeight: 900, fontSize: 22, textTransform: "uppercase", margin: 0 }}>Admin — Contact Messages</h2>
        <button onClick={load} style={{ background: "none", border: `1px solid ${pal.ink}40`, color: pal.ink, padding: "5px 12px", fontSize: 11, cursor: "pointer" }}>
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", marginBottom: 20, border: `2px solid ${pal.ink}`, overflow: "hidden", width: "fit-content" }}>
        {[["all", "All"], ["pending", "Pending"], ["replied", "Replied"]].map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            padding: "7px 18px", fontSize: 11, fontWeight: 800, textTransform: "uppercase",
            letterSpacing: "0.05em", border: "none", cursor: "pointer",
            background: filter === key ? pal.ink : "transparent",
            color: filter === key ? pal.bg : pal.ink,
          }}>
            {label}
            {key !== "all" && (
              <span style={{ marginLeft: 5, opacity: 0.6 }}>
                ({messages.filter(m => key === "all" || m.status === key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loadError && (
        <div style={{ color: "#C7382E", fontSize: 12, marginBottom: 16, padding: "8px 12px", border: "1px solid #C7382E33" }}>
          Error: {loadError}
        </div>
      )}

      {loading ? (
        <div style={{ opacity: 0.5, fontSize: 13 }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ opacity: 0.4, fontSize: 13 }}>No messages.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map(msg => (
            <div key={msg.id} style={{
              border: `1px solid ${pal.ink}${msg.status === "pending" ? "40" : "20"}`,
              padding: 18,
              background: msg.status === "pending" ? (dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)") : "transparent",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{msg.subject}</div>
                  <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>
                    {msg.profiles?.username ?? msg.user_id} · {fmtDate(msg.created_at)}
                  </div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                  padding: "3px 8px",
                  background: msg.status === "replied" ? "#22a55a22" : "#C7382E22",
                  color: msg.status === "replied" ? "#22a55a" : "#C7382E",
                }}>
                  {msg.status === "replied" ? "Replied" : "Pending"}
                </span>
              </div>

              <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 12, whiteSpace: "pre-wrap" }}>{msg.message}</div>

              {msg.admin_reply && (
                <div style={{ borderLeft: `3px solid ${pal.ink}30`, paddingLeft: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.5, marginBottom: 4 }}>Reply · {fmtDate(msg.replied_at)}</div>
                  <div style={{ fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{msg.admin_reply}</div>
                </div>
              )}

              {replyingId === msg.id ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Reply message..."
                    rows={4}
                    style={{
                      background: pal.bg, color: pal.ink, border: `1px solid ${pal.ink}30`,
                      padding: "8px 10px", fontSize: 12, resize: "vertical", fontFamily: "inherit",
                      outline: "none", width: "100%", boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => handleReply(msg.id)}
                      disabled={sending || !replyText.trim()}
                      style={{
                        background: pal.ink, color: pal.bg, border: "none",
                        padding: "7px 16px", fontSize: 11, fontWeight: 700, cursor: sending ? "not-allowed" : "pointer",
                        opacity: sending || !replyText.trim() ? 0.5 : 1,
                      }}
                    >
                      {sending ? "Sending..." : "Send Reply"}
                    </button>
                    <button
                      onClick={() => { setReplyingId(null); setReplyText(""); }}
                      style={{ background: "none", border: `1px solid ${pal.ink}40`, color: pal.ink, padding: "7px 14px", fontSize: 11, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setReplyingId(msg.id); setReplyText(msg.admin_reply ?? ""); }}
                  style={{ background: "none", border: `1px solid ${pal.ink}30`, color: pal.ink, padding: "5px 12px", fontSize: 11, cursor: "pointer" }}
                >
                  {msg.admin_reply ? "Edit Reply" : "Reply"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
