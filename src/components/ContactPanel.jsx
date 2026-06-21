import React, { useState, useEffect } from "react";
import { Send, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { sendContactMessage, getContactMessages, sendEmailNotification } from "../api/contactApi";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function ContactPanel({ pal, t }) {
  const { session, profile } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const uid = session?.user?.id;
  const ink = pal.ink;

  useEffect(() => {
    if (!uid) return;
    setLoadingHistory(true);
    getContactMessages(uid).then(({ data }) => {
      setHistory(data);
      setLoadingHistory(false);
    });
  }, [uid]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    setError("");

    const { error: dbError } = await sendContactMessage(uid, subject.trim(), message.trim());
    if (dbError) {
      setError(t.guide.contactError || "Failed to send. Please try again.");
      setSending(false);
      return;
    }

    await sendEmailNotification({
      fromName: profile?.username || "User",
      fromEmail: session?.user?.email || "",
      subject: subject.trim(),
      message: message.trim(),
    });

    setSent(true);
    setSending(false);
    setSubject("");
    setMessage("");

    // Refresh history
    const { data } = await getContactMessages(uid);
    setHistory(data);
    setTimeout(() => setSent(false), 4000);
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    background: ink + "0a", border: `1px solid ${ink}20`,
    color: ink, padding: "9px 11px", fontSize: 12,
    outline: "none", resize: "vertical", fontFamily: "inherit",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* History */}
      {!loadingHistory && history.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.45, color: ink, margin: "0 0 8px" }}>
            {t.guide.contactHistory}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {history.map((m) => (
              <div key={m.id} style={{ border: `1px solid ${ink}18`, background: ink + "05" }}>
                <button
                  onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                  style={{
                    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: "none", border: "none", padding: "9px 12px", cursor: "pointer", color: ink, textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", flex: 1, gap: 10, alignItems: "center", minWidth: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.subject}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 6px", flexShrink: 0,
                      background: m.status === "replied" ? pal.accent2 + "30" : ink + "12",
                      color: m.status === "replied" ? pal.accent2 : ink,
                      opacity: m.status === "replied" ? 1 : 0.55,
                    }}>
                      {m.status === "replied" ? (t.guide.contactReplied || "Replied") : (t.guide.contactPending || "Pending")}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, opacity: 0.4, color: ink }}>{formatDate(m.created_at)}</span>
                    {expandedId === m.id ? <ChevronUp size={13} style={{ color: ink, opacity: 0.4 }} /> : <ChevronDown size={13} style={{ color: ink, opacity: 0.4 }} />}
                  </div>
                </button>
                {expandedId === m.id && (
                  <div style={{ padding: "0 12px 12px" }}>
                    <p style={{ fontSize: 12, lineHeight: 1.7, color: ink, opacity: 0.75, margin: "0 0 10px", whiteSpace: "pre-wrap" }}>{m.message}</p>
                    {m.admin_reply && (
                      <div style={{ borderLeft: `3px solid ${pal.accent2}`, paddingLeft: 10 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: pal.accent2, margin: "0 0 4px", textTransform: "uppercase" }}>
                          {t.guide.contactAdminReply || "Reply"} · {formatDate(m.replied_at)}
                        </p>
                        <p style={{ fontSize: 12, lineHeight: 1.7, color: ink, opacity: 0.8, margin: 0, whiteSpace: "pre-wrap" }}>{m.admin_reply}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.45, color: ink, margin: 0 }}>
          {t.guide.contactFormTitle}
        </p>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={t.guide.contactSubjectPlaceholder || "Subject"}
          required
          style={inputStyle}
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t.guide.contactMessagePlaceholder || "Describe your question or feedback…"}
          required
          rows={4}
          style={inputStyle}
        />
        {error && <p style={{ fontSize: 11, color: "#D1483D", margin: 0 }}>{error}</p>}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="submit"
            disabled={sending || !subject.trim() || !message.trim()}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: sending || !subject.trim() || !message.trim() ? pal.accent2 + "55" : pal.accent2,
              color: "#fff", border: "none", padding: "9px 16px",
              fontSize: 12, fontWeight: 700, cursor: sending ? "not-allowed" : "pointer",
            }}
          >
            <Send size={12} /> {sending ? (t.guide.contactSending || "Sending…") : (t.guide.contactBtn)}
          </button>
          {sent && (
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: pal.accent2 }}>
              <CheckCircle size={13} /> {t.guide.contactSentConfirm || "Message sent!"}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
