import React, { useState } from "react";
import { Globe, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const SLIDE_ACCENT = ["#2B3DCB", "#C7382E", "#E3B22E", "#2B3DCB", "#C7382E"];

const SLIDES = {
  en: [
    {
      label: "00",
      title: ["One grid.", "Three tools.", "One life."],
      body: "'GridA' is a productivity suite built around the grid — a Mandalart for your goals, a Planner for your days, and a Pomodoro timer for your focus.",
      visual: "intro",
    },
    {
      label: "01",
      title: ["Set your goals.", "64 steps."],
      body: "Build a 9×9 goal grid with your main goal at the center. Each of 8 sub-goals expands into 8 concrete actions — 64 daily habits that compound into real progress.",
      visual: "steps",
    },
    {
      label: "02",
      title: ["Plan your", "day."],
      body: "A visual daily planner with time blocks, an event list, and to-dos. Set recurring events, view monthly plans, and watch your schedule take shape.",
      visual: "planner",
    },
    {
      label: "03",
      title: ["Focus in", "sessions."],
      body: "Set a focus timer by dragging on a grid. Watch the cells drain in real time. When it ends — step away. Then come back and repeat.",
      visual: "pomodoro",
    },
    {
      label: "04",
      title: ["Your grid", "awaits."],
      body: "Set your goals. Plan your days. Focus your hours. 'GridA' is a complete system for living intentionally.",
      visual: "done",
    },
  ],
  ko: [
    {
      label: "00",
      title: ["하나의 그리드.", "세 가지 도구.", "하나의 삶."],
      body: "'그리다'(GridA)는 그리드 중심의 생산성 앱이에요 — 목표를 위한 만다라트, 하루를 위한 플래너, 집중을 위한 뽀모도로.",
      visual: "intro",
    },
    {
      label: "01",
      title: ["목표를 설정하세요.", "64가지 실행."],
      body: "메인 목표를 중심에 두고 9×9 목표 그리드를 채워보세요. 8개의 하위 목표가 각각 8가지 실행 항목으로 펼쳐져 — 64가지 일상 습관이 됩니다.",
      visual: "steps",
    },
    {
      label: "02",
      title: ["하루를", "계획하세요."],
      body: "타임 블럭, 일정 목록, 할 일로 구성된 시각적 일간 플래너예요. 반복 일정을 설정하고 월간 계획을 한눈에 확인해요.",
      visual: "planner",
    },
    {
      label: "03",
      title: ["세션으로", "집중하세요."],
      body: "그리드를 드래그해 집중 타이머를 설정하세요. 칸이 실시간으로 줄어드는 걸 지켜보다가 — 끝나면 잠깐 쉬고, 다시 반복해요.",
      visual: "pomodoro",
    },
    {
      label: "04",
      title: ["당신의 그리드가", "기다려요."],
      body: "목표를 세우고. 하루를 계획하고. 시간을 집중하세요. '그리다'(GridA)는 의도적인 삶을 위한 완결된 시스템이에요.",
      visual: "done",
    },
  ],
};

// ── SVG Visuals ──────────────────────────────────────────
const C = { red: "#C7382E", blue: "#2B3DCB", yellow: "#E3B22E", cream: "#F0EBE0" };
const CELL = 36, GAP = 4;
const pos = (i) => ({ x: (i % 3) * (CELL + GAP), y: Math.floor(i / 3) * (CELL + GAP) });

function GridVisual({ type }) {
  const size = 3 * CELL + 2 * GAP;

  if (type === "intro") {
    const fills = [C.red, C.yellow, C.cream, C.red, C.yellow, C.blue, C.cream, C.yellow, C.blue];
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {fills.map((f, i) => { const p = pos(i); return <rect key={i} x={p.x} y={p.y} width={CELL} height={CELL} fill={f} />; })}
        <rect x={pos(4).x} y={pos(4).y} width={CELL} height={CELL} fill={C.cream} />
      </svg>
    );
  }

  if (type === "steps") {
    const MINI = 10, MGAP = 2;
    const blockColors = [C.red, C.yellow, C.blue, C.yellow, C.red, C.blue, C.blue, C.cream, C.yellow];
    const s9 = 9 * MINI + 10 * MGAP;
    return (
      <svg width={s9} height={s9} viewBox={`0 0 ${s9} ${s9}`}>
        {Array.from({ length: 81 }).map((_, i) => {
          const col = i % 9, row = Math.floor(i / 9);
          const bIdx = Math.floor(row / 3) * 3 + Math.floor(col / 3);
          const isCenter = row === 4 && col === 4;
          return <rect key={i}
            x={col * (MINI + MGAP)} y={row * (MINI + MGAP)}
            width={MINI} height={MINI}
            fill={isCenter ? C.yellow : blockColors[bIdx] + "80"}
          />;
        })}
      </svg>
    );
  }

  if (type === "planner") {
    const cols = 3, rows = 6, w = (size - (cols - 1) * GAP) / cols, h = (size - (rows - 1) * GAP) / rows;
    const BRIGHT_Y = "#F5C840";
    const blockFills = [C.red, "none", C.blue, C.blue, "none", BRIGHT_Y, "none", C.blue, "none", "none", C.red, C.red, "none", "none", BRIGHT_Y, BRIGHT_Y, "none", "none"];
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {Array.from({ length: cols * rows }).map((_, i) => {
          const col = i % cols, row = Math.floor(i / cols);
          const x = col * (w + GAP), y = row * (h + GAP);
          const fill = blockFills[i] === "none" ? "rgba(255,255,255,0.07)" : blockFills[i] + "ee";
          return <rect key={i} x={x} y={y} width={w} height={h} fill={fill} />;
        })}
      </svg>
    );
  }

  if (type === "pomodoro") {
    // Draining grid — bottom rows empty
    const MINI = 10, MGAP = 2, COLS = 9, ROWS = 5;
    const sw = COLS * MINI + (COLS - 1) * MGAP;
    const sh = ROWS * MINI + (ROWS - 1) * MGAP;
    return (
      <svg width={sw} height={sh} viewBox={`0 0 ${sw} ${sh}`}>
        {Array.from({ length: COLS * ROWS }).map((_, i) => {
          const col = i % COLS, row = Math.floor(i / COLS);
          const drained = row >= 3 || (row === 2 && col >= 5);
          return <rect key={i}
            x={col * (MINI + MGAP)} y={row * (MINI + MGAP)}
            width={MINI} height={MINI}
            fill={drained ? "rgba(255,255,255,0.08)" : C.red + "cc"}
          />;
        })}
      </svg>
    );
  }

  if (type === "done") {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect width={size} height={size} fill={C.cream + "18"} />
        <polyline
          points={`${size * 0.18},${size * 0.52} ${size * 0.42},${size * 0.74} ${size * 0.82},${size * 0.3}`}
          fill="none" stroke={C.yellow} strokeWidth={10} strokeLinecap="square" strokeLinejoin="miter"
        />
      </svg>
    );
  }

  return null;
}

// ── Main Component ─────────────────────────────────────
export default function WelcomeScreen({ play, onFinish }) {
  const [lang, setLang] = useState("en");
  const [slide, setSlide] = useState(0);
  const [visible, setVisible] = useState(true);

  const slides = SLIDES[lang];
  const cur = slides[slide];
  const accent = SLIDE_ACCENT[slide];
  const isLast = slide === slides.length - 1;

  const FADE_MS = 600;

  const transition = (fn) => {
    setVisible(false);
    setTimeout(() => { fn(); setVisible(true); }, FADE_MS);
  };

  const goNext = () => {
    if (isLast) { setVisible(false); setTimeout(onFinish, FADE_MS); return; }
    transition(() => setSlide(s => s + 1));
    play?.("D5", "64n");
  };

  const goPrev = () => {
    if (slide === 0) return;
    transition(() => setSlide(s => s - 1));
    play?.("B4", "64n");
  };

  const skip = () => { setVisible(false); setTimeout(onFinish, FADE_MS); };

  const toggleLang = () => {
    transition(() => setLang(l => l === "en" ? "ko" : "en"));
    play?.("E5", "64n");
  };

  const A = (delay, anim = "wsFadeUp") =>
    ({ animation: `${anim} 1s cubic-bezier(0.22,1,0.36,1) ${delay}s both` });

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#0d0d0d",
      display: "flex", flexDirection: "column",
      fontFamily: "Helvetica, Arial, sans-serif",
      overflow: "hidden", zIndex: 100,
    }}>
      <style>{`
        @keyframes wsFadeUp    { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:none; } }
        @keyframes wsSlideLeft { from { opacity:0; transform:translateX(-72px); } to { opacity:1; transform:none; } }
        @keyframes wsSlideRight{ from { opacity:0; transform:translateX(48px); } to { opacity:1; transform:none; } }
        @keyframes wsPopIn     { from { opacity:0; transform:scale(0.55); } to { opacity:1; transform:scale(1); } }
        @keyframes wsSlideUp   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
      `}</style>

      {/* Header bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 28px", background: "#111",
        borderBottom: "4px solid #000", flexShrink: 0,
        ...A(0, "wsFadeUp"),
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/logo.png" alt="GridA" style={{ width: 22, height: 22, objectFit: "contain" }} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontWeight: 900, fontSize: 21, color: "rgba(255,255,255,0.85)", letterSpacing: "-0.02em" }}>GRIDA</span>
            <span style={{ fontWeight: 400, fontSize: 14, color: "rgba(255,255,255,0.35)" }}>.app</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={toggleLang}
            style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "1px solid #ffffff25", color: "#F2EDE190", padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
          >
            <Globe size={12} /> {lang === "en" ? "한국어" : "English"}
          </button>
          <button
            onClick={skip}
            style={{ background: "none", border: "none", color: "#F2EDE140", fontSize: 11, cursor: "pointer", padding: "5px 8px" }}
          >
            {lang === "en" ? "Skip →" : "건너뛰기 →"}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1, display: "grid",
        gridTemplateColumns: "minmax(220px, 38%) 1fr",
        minHeight: 0,
      }}>
        {/* Left: Mondrian visual panel */}
        <div style={{
          background: accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 32, position: "relative",
          transition: "background 0.5s ease",
          borderRight: "4px solid #000",
          ...A(0.12, "wsSlideLeft"),
        }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 48, height: 48, background: "#000", ...A(0.38, "wsPopIn") }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, width: 32, height: 32,
            background: accent === "#E3B22E" ? "#C7382E" : accent === "#C7382E" ? "#E3B22E" : "#E3B22E",
            ...A(0.48, "wsPopIn"),
          }} />
          <div style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1)" : "scale(0.92)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
            ...A(0.6, "wsPopIn"),
          }}>
            <GridVisual type={cur.visual} />
          </div>
        </div>

        {/* Right: Text content */}
        <div style={{
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "clamp(28px, 5vw, 64px)",
          background: "#111", position: "relative",
          ...A(0.28, "wsSlideRight"),
        }}>
          <div style={{
            position: "absolute", top: 24, right: 28,
            fontWeight: 900, fontSize: 48, color: accent + "18",
            letterSpacing: "-0.05em", lineHeight: 1,
            transition: "color 0.4s ease", userSelect: "none",
          }}>
            {cur.label}
          </div>

          <div style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(16px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}>
            <div style={{ width: 40, height: 4, background: accent, marginBottom: 24, transition: "background 0.4s ease" }} />

            <h1 style={{
              fontWeight: 900, margin: "0 0 20px",
              fontSize: "clamp(28px, 4vw, 52px)",
              lineHeight: 1.05, letterSpacing: "-0.03em",
              color: "#F2EDE1", textTransform: "uppercase",
            }}>
              {cur.title.map((line, i) => (
                <span key={i} style={{ display: "block" }}>{line}</span>
              ))}
            </h1>

            <p style={{
              fontSize: "clamp(13px, 1.4vw, 16px)",
              lineHeight: 1.75, color: "#F2EDE1",
              opacity: 0.7, margin: "0 0 40px", maxWidth: 420,
            }}>
              {cur.body}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button
                onClick={goPrev}
                disabled={slide === 0}
                style={{
                  width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "none", border: "1px solid #ffffff20",
                  color: slide === 0 ? "#ffffff18" : "#F2EDE1",
                  cursor: slide === 0 ? "not-allowed" : "pointer",
                }}
              >
                <ChevronLeft size={16} />
              </button>

              <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => transition(() => { setSlide(i); play?.("D5", "64n"); })}
                    style={{
                      width: i === slide ? 20 : 6, height: 6,
                      background: i === slide ? accent : "#ffffff30",
                      border: "none", cursor: "pointer", padding: 0,
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </div>

              <button
                onClick={goNext}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: accent, border: "none",
                  color: accent === "#E3B22E" ? "#0d0d0d" : "#fff",
                  padding: "10px 20px", fontWeight: 800,
                  fontSize: 12, cursor: "pointer",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  transition: "background 0.4s ease",
                }}
              >
                {isLast
                  ? (lang === "en" ? "Get started" : "시작하기")
                  : (lang === "en" ? "Next" : "다음")
                }
                {isLast ? <ArrowRight size={14} /> : <ChevronRight size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Mondrian strip */}
      <div style={{ display: "flex", height: 8, flexShrink: 0 }}>
        <div style={{ flex: 1, background: "#C7382E", ...A(0.55, "wsSlideUp") }} />
        <div style={{ width: 4, background: "#000", ...A(0.6, "wsSlideUp") }} />
        <div style={{ flex: 2, background: "#2B3DCB", ...A(0.65, "wsSlideUp") }} />
        <div style={{ width: 4, background: "#000", ...A(0.7, "wsSlideUp") }} />
        <div style={{ flex: 1, background: "#E3B22E", ...A(0.75, "wsSlideUp") }} />
      </div>
    </div>
  );
}
