import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

function inputStyle(pal) {
  return {
    width: "100%", boxSizing: "border-box", background: "transparent", border: `1px solid ${pal.ink}40`,
    color: pal.ink, padding: "10px 12px", fontSize: 13, marginBottom: 10, outline: "none",
  };
}

export default function AuthGate({ pal, t }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (mode === "signup" && !termsAccepted) {
      setError(t.auth.termsRequired);
      return;
    }
    setError("");
    setBusy(true);
    const { error } = mode === "signin" ? await signIn(email, password) : await signUp(email, password, username);
    setBusy(false);
    if (error) setError(error.message);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: pal.bg, padding: 24 }}>
      <div style={{ width: 340 }}>
        <form onSubmit={submit} style={{ border: `3px solid ${pal.accent}`, padding: 28, background: pal.bg }}>
          <h1 style={{ fontWeight: 900, fontSize: 28, color: pal.ink, margin: "0 0 20px", textTransform: "uppercase" }}>{t.title}</h1>

          {mode === "signup" && (
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t.auth.username} style={inputStyle(pal)} required />
          )}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.auth.email} style={inputStyle(pal)} required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.auth.password} style={inputStyle(pal)} required minLength={6} />

          {mode === "signup" && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", fontSize: 12, color: pal.ink, lineHeight: 1.5 }}>
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  style={{ marginTop: 2, accentColor: pal.accent, cursor: "pointer" }}
                />
                <span>
                  {t.auth.termsPrefix}{" "}
                  <button type="button" onClick={() => setShowTerms((s) => !s)} style={{ background: "none", border: "none", color: pal.accent, cursor: "pointer", fontSize: 12, padding: 0, textDecoration: "underline" }}>
                    {t.auth.termsLink}
                  </button>
                </span>
              </label>
            </div>
          )}

          {error && <p style={{ color: "#D1483D", fontSize: 12, margin: "0 0 10px" }}>{error}</p>}

          <button
            type="submit"
            disabled={busy || (mode === "signup" && !termsAccepted)}
            style={{ width: "100%", background: busy || (mode === "signup" && !termsAccepted) ? pal.accent + "66" : pal.accent, color: "#fff", border: "none", padding: "10px 0", fontWeight: 700, fontSize: 13, cursor: busy || (mode === "signup" && !termsAccepted) ? "not-allowed" : "pointer", marginTop: 4 }}
          >
            {mode === "signin" ? t.auth.signIn : t.auth.signUp}
          </button>
          <button
            type="button"
            onClick={() => { setMode((m) => (m === "signin" ? "signup" : "signin")); setError(""); setTermsAccepted(false); setShowTerms(false); }}
            style={{ background: "none", border: "none", color: pal.ink, opacity: 0.6, fontSize: 12, marginTop: 12, cursor: "pointer", width: "100%" }}
          >
            {mode === "signin" ? t.auth.toSignUp : t.auth.toSignIn}
          </button>
        </form>

        {showTerms && mode === "signup" && (
          <div style={{ marginTop: 12, border: `1px solid ${pal.ink}30`, padding: 20, background: pal.bg }}>
            <h3 style={{ fontWeight: 800, fontSize: 13, textTransform: "uppercase", color: pal.ink, margin: "0 0 12px" }}>{t.auth.termsTitle}</h3>
            <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              {t.auth.termsClauses.map((clause, i) => (
                <li key={i} style={{ fontSize: 12, lineHeight: 1.6, color: pal.ink, opacity: 0.8 }}>{clause}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
