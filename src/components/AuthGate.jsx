import React, { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { T } from "../copy";
import WelcomeScreen from "./WelcomeScreen";

const BLOCKS = [
  { id: 0, color: "#C7382E", col: "1/3", row: "1/3" },
  { id: 1, color: "#F0EBE0", col: "3/4", row: "1/2" },
  { id: 2, color: "#2B3DCB", col: "4/7", row: "1/3" },
  { id: 3, color: "#F0EBE0", col: "3/4", row: "2/3" },
  { id: 4, color: "#F0EBE0", col: "1/2", row: "3/4" },
  { id: 5, color: "#E3B22E", col: "2/4", row: "3/5" },
  { id: 6, color: "#F0EBE0", col: "4/5", row: "3/4" },
  { id: 7, color: "#C7382E", col: "5/7", row: "3/4" },
  { id: 8, color: "#2B3DCB", col: "1/2", row: "4/5" },
  { id: 9, color: "#F0EBE0", col: "4/7", row: "4/5" },
];
const BLOCK_NOTES = ["C5", "E5", "G5", "A5", "B5", "D5", "F5", "G4", "A4", "C6"];

function MondrianBg({ play }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{
      position: "fixed", inset: 0,
      display: "grid",
      gridTemplateColumns: "repeat(6, 1fr)",
      gridTemplateRows: "repeat(4, 1fr)",
      gap: 5, padding: 5, background: "#111", zIndex: 0,
    }}>
      {BLOCKS.map((b, i) => (
        <div
          key={b.id}
          onMouseEnter={() => { setHovered(b.id); play?.(BLOCK_NOTES[i % BLOCK_NOTES.length], "64n"); }}
          onMouseLeave={() => setHovered(null)}
          style={{
            gridColumn: b.col, gridRow: b.row,
            background: b.color,
            transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), filter 0.2s ease",
            transform: hovered === b.id ? "scale(0.96)" : "scale(1)",
            filter: hovered === b.id ? "brightness(1.22)" : "brightness(1)",
            cursor: "default",
          }}
        />
      ))}
    </div>
  );
}

// ── Insert page shown after "Get Started" ──────────────
function InsertPage({ onDone }) {
  // phase: 0 = logo fading in, 1 = logo up + tagline in, 2 = fade out
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 700);
    const t2 = setTimeout(() => setPhase(2), 1900);
    const t3 = setTimeout(onDone, 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "#0d0d0d",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "Helvetica, Arial, sans-serif",
      opacity: phase === 2 ? 0 : 1,
      transition: phase === 2 ? "opacity 0.65s ease" : "none",
      zIndex: 10,
    }}>
      <style>{`
        @keyframes ipLogoIn   { from { opacity:0; transform:scale(0.7); } to { opacity:1; transform:scale(1); } }
        @keyframes ipTagIn    { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
      `}</style>

      {/* Logo */}
      <div style={{
        animation: "ipLogoIn 0.65s cubic-bezier(0.22,1,0.36,1) both",
        transform: phase >= 1 ? "translateY(-28px)" : "none",
        transition: phase >= 1 ? "transform 0.55s cubic-bezier(0.22,1,0.36,1)" : "none",
        marginBottom: phase >= 1 ? 0 : 0,
      }}>
        <img src="/logo.png" alt="GridA" style={{ width: 88, height: 88, objectFit: "contain", display: "block" }} />
      </div>

      {/* Title + tagline */}
      <div style={{
        textAlign: "center", marginTop: 22,
        opacity: phase >= 1 ? 1 : 0,
        animation: phase >= 1 ? "ipTagIn 0.55s 0.05s cubic-bezier(0.22,1,0.36,1) both" : "none",
      }}>
        <div style={{
          fontWeight: 900, fontSize: 28, letterSpacing: "0.18em",
          color: "#F2EDE1", textTransform: "uppercase", marginBottom: 10,
        }}>
          GRIDA
        </div>
        <div style={{
          fontStyle: "italic", fontSize: 13, color: "rgba(242,237,225,0.55)",
          letterSpacing: "0.04em", fontWeight: 400,
        }}>
          Composition with Your Day, Year, and Life
        </div>
      </div>
    </div>
  );
}

function inputStyle() {
  return {
    width: "100%", boxSizing: "border-box",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#F2EDE1",
    padding: "10px 12px", fontSize: 13, marginBottom: 10, outline: "none",
  };
}

export default function AuthGate({ play }) {
  const { signIn, signUp } = useAuth();

  // flow: "welcome" → "insert" → "login"
  const [screen, setScreen] = useState("welcome");
  const [loginVisible, setLoginVisible] = useState(false);
  const [lang, setLang] = useState("en");
  const t = T[lang];

  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (screen === "welcome") {
    return <WelcomeScreen play={play} onFinish={() => setScreen("insert")} />;
  }

  if (screen === "insert") {
    return <InsertPage onDone={() => {
      setScreen("login");
      setTimeout(() => setLoginVisible(true), 80);
    }} />;
  }

  const INK = "#F2EDE1";
  const ACCENT = "#C7382E";

  const submit = async (e) => {
    e.preventDefault();
    if (mode === "signup" && !termsAccepted) { setError(t.auth.termsRequired); return; }
    setError("");
    setBusy(true);
    const { error } = mode === "signin"
      ? await signIn(email, password)
      : await signUp(email, password, username);
    setBusy(false);
    if (error) setError(error.message);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative",
      opacity: loginVisible ? 1 : 0,
      transition: "opacity 0.9s ease",
    }}>
      <MondrianBg play={play} />

      {/* Top-left brand */}
      <div style={{
        position: "fixed", top: 16, left: 20, zIndex: 2,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <img src="/logo.png" alt="GridA" style={{ width: 22, height: 22, objectFit: "contain" }} />
        <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
          <span style={{ fontWeight: 900, fontSize: 15, color: "rgba(242,237,225,0.85)", letterSpacing: "-0.01em" }}>GRIDA</span>
          <span style={{ fontWeight: 400, fontSize: 12, color: "rgba(242,237,225,0.35)" }}>.app</span>
        </div>
      </div>

      {/* Language toggle */}
      <button
        onClick={() => setLang(l => l === "en" ? "ko" : "en")}
        style={{
          position: "fixed", top: 16, right: 16, zIndex: 2,
          display: "flex", alignItems: "center", gap: 5,
          background: "rgba(18,18,18,0.75)", backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.2)", color: "#F2EDE1",
          padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer",
        }}
      >
        <Globe size={12} /> {lang === "en" ? "한국어" : "English"}
      </button>

      <div style={{ width: 340, position: "relative", zIndex: 1 }}>
        <form
          onSubmit={submit}
          style={{
            border: `3px solid ${ACCENT}`,
            padding: 28,
            background: "rgba(18,18,18,0.88)",
            backdropFilter: "blur(8px)",
          }}
        >
          {/* Form header: logo + brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 22px" }}>
            <img src="/logo.png" alt="GridA" style={{ width: 32, height: 32, objectFit: "contain", flexShrink: 0 }} />
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontWeight: 900, fontSize: 22, color: INK, textTransform: "uppercase", letterSpacing: "-0.02em" }}>GRIDA</span>
              <span style={{ fontWeight: 400, fontSize: 14, color: INK, opacity: 0.45 }}>.app</span>
            </div>
          </div>

          {mode === "signup" && (
            <>
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t.auth.username} style={inputStyle()} required />
              <p style={{ fontSize: 11, color: "#F2EDE1", opacity: 0.4, margin: "-6px 0 10px", lineHeight: 1.5 }}>{t.auth.usernameHint}</p>
            </>
          )}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.auth.email} style={inputStyle()} required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.auth.password} style={inputStyle()} required minLength={6} />

          {mode === "signup" && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", fontSize: 12, color: INK, lineHeight: 1.5 }}>
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  style={{ marginTop: 2, accentColor: ACCENT, cursor: "pointer" }}
                />
                <span>
                  {t.auth.termsPrefix}{" "}
                  <button type="button" onClick={() => setShowTerms((s) => !s)} style={{ background: "none", border: "none", color: ACCENT, cursor: "pointer", fontSize: 12, padding: 0, textDecoration: "underline" }}>
                    {t.auth.termsLink}
                  </button>
                </span>
              </label>
            </div>
          )}

          {error && <p style={{ color: "#ff6b6b", fontSize: 12, margin: "0 0 10px" }}>{error}</p>}

          <button
            type="submit"
            disabled={busy || (mode === "signup" && !termsAccepted)}
            style={{ width: "100%", background: busy || (mode === "signup" && !termsAccepted) ? ACCENT + "66" : ACCENT, color: "#fff", border: "none", padding: "10px 0", fontWeight: 700, fontSize: 13, cursor: busy || (mode === "signup" && !termsAccepted) ? "not-allowed" : "pointer", marginTop: 4 }}
          >
            {mode === "signin" ? t.auth.signIn : t.auth.signUp}
          </button>
          <button
            type="button"
            onClick={() => { setMode((m) => (m === "signin" ? "signup" : "signin")); setError(""); setTermsAccepted(false); setShowTerms(false); }}
            style={{ background: "none", border: "none", color: INK, opacity: 0.55, fontSize: 12, marginTop: 12, cursor: "pointer", width: "100%" }}
          >
            {mode === "signin" ? t.auth.toSignUp : t.auth.toSignIn}
          </button>
        </form>

        {showTerms && mode === "signup" && (
          <div style={{ marginTop: 8, border: "1px solid rgba(255,255,255,0.15)", padding: 20, background: "rgba(18,18,18,0.88)", backdropFilter: "blur(8px)" }}>
            <h3 style={{ fontWeight: 800, fontSize: 13, textTransform: "uppercase", color: INK, margin: "0 0 12px" }}>{t.auth.termsTitle}</h3>
            <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              {t.auth.termsClauses.map((clause, i) => (
                <li key={i} style={{ fontSize: 12, lineHeight: 1.6, color: INK, opacity: 0.75 }}>{clause}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
