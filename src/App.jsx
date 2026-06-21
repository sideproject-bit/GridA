import React, { useState, useEffect, useRef } from "react";
import { User, Plus, FolderKanban, HelpCircle, ArrowLeft, BookOpen } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { paletteFor, THEMES } from "./theme";
import { T } from "./copy";
import { useSound } from "./useSound";
import { useMusicPlayer } from "./useMusic";
import AuthGate from "./components/AuthGate";
import Onboarding from "./components/Onboarding";
import TopControls from "./components/TopControls";
import MandalartGrid from "./components/MandalartGrid";
import Manage from "./components/Manage";
import AboutPage from "./components/AboutPage";
import FriendsPanel from "./components/FriendsPanel";
import FriendMandalartList from "./components/FriendMandalartList";
import { createMandalart } from "./api/mandalartsApi";
import { supabase } from "./lib/supabaseClient";

function AppShell() {
  const { session, profile, loading, signOut } = useAuth();
  const [dark, setDark] = useState(true);
  const [theme, setTheme] = useState("mondrian");
  const [lang, setLang] = useState("en");
  const [soundOn, setSoundOn] = useState(true);
  const [view, setView] = useState("home");
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [currentMandalartId, setCurrentMandalartId] = useState(null);
  const [viewingFriend, setViewingFriend] = useState(null);
  const [viewingMandalart, setViewingMandalart] = useState(null);
  const [signOutConfirm, setSignOutConfirm] = useState(false);
  const prevUserIdRef = useRef(null);

  const pal = paletteFor(theme, dark);
  const t = T[lang];
  const play = useSound(soundOn);
  const music = useMusicPlayer();

  // Load theme + music from localStorage when user logs in; reset view to home
  useEffect(() => {
    if (!session?.user?.id) return;
    const uid = session.user.id;
    if (uid !== prevUserIdRef.current) {
      prevUserIdRef.current = uid;
      setView("home");
      const savedTheme = localStorage.getItem(`theme_${uid}`);
      if (savedTheme && THEMES[savedTheme]) setTheme(savedTheme);
      const savedMusic = localStorage.getItem(`music_${uid}`);
      if (savedMusic !== null) {
        const idx = parseInt(savedMusic, 10);
        if (!isNaN(idx) && idx >= 0) music.selectTrack(idx);
      }
    }
  }, [session?.user?.id]);

  // Save theme to localStorage keyed by user id
  useEffect(() => {
    if (session?.user?.id) {
      localStorage.setItem(`theme_${session.user.id}`, theme);
    }
  }, [theme, session?.user?.id]);

  // Save music track selection to localStorage
  useEffect(() => {
    if (session?.user?.id) {
      if (music.trackIndex === null) {
        localStorage.removeItem(`music_${session.user.id}`);
      } else {
        localStorage.setItem(`music_${session.user.id}`, String(music.trackIndex));
      }
    }
  }, [music.trackIndex, session?.user?.id]);

  // Open onboarding only on first visit (profile.has_seen_onboarding === false)
  useEffect(() => {
    if (profile && profile.has_seen_onboarding === false) {
      setOnboardingOpen(true);
    }
  }, [profile]);

  const closeOnboarding = async () => {
    setOnboardingOpen(false);
    if (profile && !profile.has_seen_onboarding) {
      await supabase.from("profiles").update({ has_seen_onboarding: true }).eq("id", profile.id);
    }
  };

  const handleSignOut = async () => {
    setSignOutConfirm(false);
    music.stop();
    await signOut();
  };

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: pal.bg, color: pal.ink }}>{t.loading}</div>;
  }
  if (!session) {
    return <AuthGate pal={pal} t={t} />;
  }

  const myId = session.user.id;
  const myCode = profile ? `${profile.username}#${profile.tag}` : "";

  const goCreate = async () => {
    const m = await createMandalart(myId, t.grid.untitled);
    if (m) {
      setCurrentMandalartId(m.id);
      setView("grid");
      play("C5", "16n");
    }
  };

  return (
    <div style={{ background: pal.bg, color: pal.ink, minHeight: "100vh", fontFamily: "Helvetica, Arial, sans-serif", padding: 28, position: "relative" }}>
      <style>{`
        @keyframes pulseOutline { 0%,100% { box-shadow: 0 0 0 0 ${pal.accent}66; } 50% { box-shadow: 0 0 0 6px ${pal.accent}33; } }
        .cell-pulse { animation: pulseOutline 0.9s ease-in-out; }
        .fade-in { animation: fadeIn 0.25s ease-out; }
        @keyframes fadeIn { from { opacity:0; transform: translateY(6px);} to { opacity:1; transform:none; } }
        textarea::placeholder { opacity: 0.4; }
        button:focus-visible, input:focus-visible, textarea:focus-visible { outline: 2px solid ${pal.accent}; }
        @media (prefers-reduced-motion: reduce) { .cell-pulse, .fade-in { animation: none !important; } }
      `}</style>

      {onboardingOpen && <Onboarding t={t} pal={pal} play={play} onClose={closeOnboarding} />}

      {view === "home" && (() => {
        const newBg = theme === "yellow" ? "#C9991A" : "#E3B22E";
        return (
          <div className="fade-in" style={{ margin: -28, height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{
              flex: 1, minHeight: 0,
              background: "#000", display: "grid", gap: 4, padding: 4,
              gridTemplateColumns: "3fr 1fr",
              gridTemplateRows: "1fr 1fr",
            }}>
              {/* Title block — spans both rows */}
              <div style={{
                gridRow: "1 / 3", gridColumn: "1",
                background: pal.accent2,
                padding: "clamp(20px, 4vw, 56px)",
                display: "flex", flexDirection: "column", justifyContent: "space-between",
              }}>
                <div>
                  <h1 style={{
                    fontWeight: 900,
                    fontSize: "clamp(60px, 11vw, 180px)",
                    letterSpacing: "-0.03em",
                    lineHeight: 0.88,
                    margin: 0,
                    color: "#fff",
                    textTransform: "uppercase",
                    textAlign: "center",
                  }}>
                    {t.title}
                  </h1>
                  <p style={{ fontSize: 11, letterSpacing: "0.12em", opacity: 0.6, margin: "14px 0 0", color: "#fff", textTransform: "uppercase", textAlign: "center" }}>
                    {t.tagline}
                  </p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
                  <TopControls pal={{ ...pal, ink: "#fff" }} dark={dark} setDark={setDark} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} soundOn={soundOn} setSoundOn={setSoundOn} t={t} play={play} music={music} dropdownUp={true} />
                  <button onClick={() => { setOnboardingOpen(true); play("G4", "16n"); }} style={{ background: "none", border: "none", color: "#fff", opacity: 0.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                    <HelpCircle size={14} /> {t.replay}
                  </button>
                </div>
              </div>

              {/* Profile — top right */}
              <button onClick={() => { setView("profile"); play("C5", "16n"); }}
                style={{ gridRow: "1", gridColumn: "2", background: pal.bg, border: "none", padding: "clamp(16px,2.5vw,32px) 20px", cursor: "pointer", color: pal.ink, textAlign: "left", display: "flex", flexDirection: "column", gap: 10 }}>
                <User size={20} color={pal.ink} />
                <span style={{ fontWeight: 800, fontSize: 13, textTransform: "uppercase" }}>{t.menu.profile}</span>
              </button>

              {/* New Mandalart — always yellow, bottom right */}
              <button onClick={goCreate}
                style={{ gridRow: "2", gridColumn: "2", background: newBg, border: "none", padding: "clamp(16px,2.5vw,32px) 20px", cursor: "pointer", color: "#1a1a1a", textAlign: "left", display: "flex", flexDirection: "column", gap: 10 }}>
                <Plus size={20} color="#1a1a1a" />
                <span style={{ fontWeight: 800, fontSize: 13, textTransform: "uppercase" }}>{t.menu.create}</span>
              </button>
            </div>

            {/* Bottom bar */}
            <div style={{ background: "#000", display: "grid", gap: 4, padding: "0 4px 4px", gridTemplateColumns: "1fr 1fr", flexShrink: 0 }}>
              <button onClick={() => { setView("manage"); play("C5", "16n"); }}
                style={{ background: pal.accent, border: "none", padding: "18px 24px", cursor: "pointer", color: "#fff", textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}>
                <FolderKanban size={18} color="#fff" />
                <span style={{ fontWeight: 800, fontSize: 13, textTransform: "uppercase" }}>{t.menu.manage}</span>
              </button>
              <button onClick={() => { setView("about"); play("G4", "16n"); }}
                style={{ background: pal.bg, border: "none", padding: "18px 24px", cursor: "pointer", color: pal.ink, textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}>
                <BookOpen size={18} color={pal.ink} />
                <span style={{ fontWeight: 800, fontSize: 13, textTransform: "uppercase", opacity: 0.65 }}>{t.menu.about}</span>
              </button>
            </div>
          </div>
        );
      })()}

      {view === "grid" && currentMandalartId && (
        <div className="fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
            <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: pal.ink, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <ArrowLeft size={14} /> {t.back}
            </button>
            <TopControls pal={pal} dark={dark} setDark={setDark} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} soundOn={soundOn} setSoundOn={setSoundOn} t={t} play={play} music={music} dropdownUp={false} />
          </div>
          <MandalartGrid key={currentMandalartId} mandalartId={currentMandalartId} pal={pal} t={t} soundOn={soundOn} />
        </div>
      )}

      {view === "manage" && (
        <div className="fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
            <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: pal.ink, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <ArrowLeft size={14} /> {t.back}
            </button>
            <TopControls pal={pal} dark={dark} setDark={setDark} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} soundOn={soundOn} setSoundOn={setSoundOn} t={t} play={play} music={music} dropdownUp={false} />
          </div>
          <Manage
            pal={pal}
            t={t}
            myId={myId}
            onOpen={(id) => { setCurrentMandalartId(id); setView("grid"); play("C5", "16n"); }}
          />
        </div>
      )}

      {view === "profile" && (
        <div className="fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
            <button onClick={() => { setView("home"); setSignOutConfirm(false); }} style={{ background: "none", border: "none", color: pal.ink, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <ArrowLeft size={14} /> {t.back}
            </button>
            <TopControls pal={pal} dark={dark} setDark={setDark} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} soundOn={soundOn} setSoundOn={setSoundOn} t={t} play={play} music={music} dropdownUp={false} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
            <h2 style={{ fontWeight: 900, fontSize: 24, textTransform: "uppercase", margin: 0 }}>{t.menu.profile}</h2>
            {signOutConfirm ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, opacity: 0.75, color: pal.ink }}>{t.auth.signOutConfirm}</span>
                <button onClick={handleSignOut} style={{ background: "#C7382E", color: "#fff", border: "none", padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{t.auth.signOutYes}</button>
                <button onClick={() => setSignOutConfirm(false)} style={{ background: "none", border: `1px solid ${pal.ink}40`, color: pal.ink, padding: "6px 12px", fontSize: 11, cursor: "pointer" }}>{t.auth.signOutNo}</button>
              </div>
            ) : (
              <button onClick={() => setSignOutConfirm(true)} style={{ background: "none", border: `1px solid ${pal.ink}40`, color: pal.ink, padding: "6px 12px", fontSize: 11, cursor: "pointer" }}>
                {t.auth.signOut}
              </button>
            )}
          </div>
          <FriendsPanel
            pal={pal}
            t={t}
            play={play}
            myId={myId}
            myCode={myCode}
            onViewFriend={(friend) => { setViewingFriend(friend); setView("friendList"); play("C5", "16n"); }}
          />
        </div>
      )}

      {view === "friendList" && (
        <div className="fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
            <button onClick={() => setView("profile")} style={{ background: "none", border: "none", color: pal.ink, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <ArrowLeft size={14} /> {t.back}
            </button>
            <TopControls pal={pal} dark={dark} setDark={setDark} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} soundOn={soundOn} setSoundOn={setSoundOn} t={t} play={play} music={music} dropdownUp={false} />
          </div>
          <FriendMandalartList
            friend={viewingFriend}
            pal={pal}
            t={t}
            onOpen={(m) => { setViewingMandalart(m); setView("viewer"); play("C5", "16n"); }}
          />
        </div>
      )}

      {view === "about" && (
        <div className="fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
            <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: pal.ink, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <ArrowLeft size={14} /> {t.back}
            </button>
          </div>
          <AboutPage pal={pal} t={t} />
        </div>
      )}

      {view === "viewer" && viewingMandalart && (
        <div className="fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
            <button onClick={() => setView("friendList")} style={{ background: "none", border: "none", color: pal.ink, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <ArrowLeft size={14} /> {t.back}
            </button>
            <TopControls pal={pal} dark={dark} setDark={setDark} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} soundOn={soundOn} setSoundOn={setSoundOn} t={t} play={play} music={music} dropdownUp={false} />
          </div>
          <MandalartGrid
            key={`viewer-${viewingMandalart.id}`}
            mandalartId={viewingMandalart.id}
            pal={pal}
            t={t}
            soundOn={soundOn}
            readOnly
            ownerLabel={viewingFriend?.code}
          />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
