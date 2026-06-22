import React, { useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

const GRID_KO = [
  ["몸관리",            "영양제 먹기",              "FSQ 90kg",                  "인스텝 개선",          "몸통 강화",          "축 흔들지 않기",     "각도를 만든다",          "위에서부터\n공을 던진다", "손목 강화"],
  ["유연성",            "몸 만들기",                "RSQ 130kg",                 "릴리즈 포인트\n안정",  "제구",               "불안정 없애기",      "힘 모으기",              "구위",                "하반신 주도"],
  ["스테미너",          "가동역",                   "식사\n저녁7순갈\n아침3순갈", "하체 강화",            "몸을 열지 않기",     "멘탈을 컨트롤",      "볼을\n앞에서 릴리즈",    "회전수 증가",         "가동력"],
  ["뚜렷한\n목표·목적", "일희일비\n하지 않기",      "머리는 차갑게\n심장은 뜨겁게", "몸 만들기",          "제구",               "구위",               "축을 돌리기",            "하체 강화",           "체중 증가"],
  ["핀치에 강하게",     "멘탈",                     "분위기에\n휩쓸리지 않기",   "멘탈",                 "8구단\n드래프트\n1순위", "스피드\n160km/h",  "몸통 강화",              "스피드\n160km/h",     "어깨주변 강화"],
  ["마음의 파도를\n안만들기", "승리에\n대한 집념",   "동료를\n배려하는 마음",     "인간성",               "운",                 "변화구",             "가동력",                 "라이너 캐치볼",       "피칭 늘리기"],
  ["감성",              "사랑받는 사람",            "계획성",                    "인사하기",             "쓰레기 줍기",        "부실 청소",          "카운트볼 늘리기",        "포크볼 완성",         "슬라이더 구위"],
  ["배려",              "인간성",                   "감사",                      "물건을\n소중히 쓰자",  "운",                 "심판을\n대하는 태도","늦게 낙차가\n있는 커브", "변화구",              "좌타자 결정구"],
  ["예의",              "신뢰받는 사람",            "지속력",                    "긍정적 사고",          "응원받는 사람",      "책읽기",             "직구와\n같은 폼으로",    "스트라이크볼\n던질 때 제구", "거리를 상상하기"],
];

const GRID_EN = [
  ["Body care",         "Take supplements",         "FSQ 90kg",                  "Improve inStep",       "Core strength",      "Stable axis",        "Create angle",           "Throw from\nabove",    "Wrist strength"],
  ["Flexibility",       "Body building",            "RSQ 130kg",                 "Stable release\npoint","Control",            "Eliminate\ninstability","Gather power",          "Pitch quality",       "Lower body-led"],
  ["Stamina",           "Range of motion",          "Meals:\nDinner ×7\nBreakfast ×3","Leg strength",    "Don't open\nbody",   "Mental\ncontrol",    "Release out\nfront",     "Increase\nspin rate", "Mobility"],
  ["Clear goals\n& purpose","No emotional\nswings", "Cool head,\nwarm heart",    "Body building",        "Control",            "Pitch quality",      "Rotate the\naxis",       "Leg strength",        "Weight gain"],
  ["Strong under\npressure","Mental",               "Don't get\nswept up",       "Mental",               "Draft #1\nby all 8\nteams","Speed\n160km/h","Core strength",          "Speed\n160km/h",      "Shoulder\nstrength"],
  ["Stay composed",     "Win at\nall costs",        "Care for\nteammates",       "Character",            "Luck",               "Breaking\nball",     "Mobility",               "Liner catch",         "More pitching"],
  ["Empathy",           "Be loved",                 "Planning",                  "Greet people",         "Pick up\ntrash",     "Clean\ndugout",      "More count\npitches",    "Perfect\nfork ball",   "Slider\nquality"],
  ["Consideration",     "Character",                "Gratitude",                 "Treat things\nwith care","Luck",             "Respect\numpires",   "Late-drop\ncurve",       "Breaking\nball",      "Lefty out-pitch"],
  ["Etiquette",         "Be trustworthy",           "Persistence",               "Positive\nthinking",   "Be cheered on",      "Read books",         "Same form as\nfastball", "Strike\ncontrol",     "Visualize\ndistance"],
];

const MAIN = (r, c) => r === 4 && c === 4;
const SUBGOAL = (r, c) => [1, 4, 7].includes(r) && [1, 4, 7].includes(c) && !MAIN(r, c);

function CellBox({ cell, isMain, isSub, pal, big = false }) {
  const bg = isMain ? pal.accent : isSub ? pal.accent2 + "44" : pal.accent3 + "18";
  const border = isMain
    ? `1px solid ${pal.accent}`
    : isSub
    ? `1px solid ${pal.accent2}66`
    : `1px solid ${pal.accent3}28`;
  return (
    <div style={{
      background: bg, border,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: big ? 8 : 3,
      height: "100%", boxSizing: "border-box",
    }}>
      <span style={{
        fontSize: big ? (isMain ? 13 : 11) : (isMain ? 8.5 : 7.5),
        fontWeight: isMain ? 800 : isSub ? 700 : 500,
        color: isMain ? "#fff" : pal.ink,
        textAlign: "center",
        lineHeight: 1.35,
        wordBreak: "keep-all",
        whiteSpace: "pre-wrap",
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: big ? 6 : 4,
        WebkitBoxOrient: "vertical",
        opacity: isMain ? 1 : isSub ? 0.95 : 0.82,
      }}>
        {cell}
      </span>
    </div>
  );
}

export default function OhtaniMandalart({ pal, t }) {
  const isKo = t.about.ohtaniLabel === "오타니 방식";
  const grid = isKo ? GRID_KO : GRID_EN;
  const [compact, setCompact] = useState(false);
  const [focusBlock, setFocusBlock] = useState([1, 1]);
  const [fbr, fbc] = focusBlock;

  const label = t.about.ohtaniGridLabel;
  const caption = t.about.ohtaniGridCaption;
  const cta = t.about.ohtaniGridCta;
  const fullViewLabel = isKo ? "전체 보기" : "Full Grid";
  const focusViewLabel = isKo ? "포커스 뷰" : "Focus View";

  return (
    <div style={{ marginTop: 40 }}>
      <div style={{ borderTop: `3px solid ${pal.ink}`, marginBottom: 16 }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 16 }}>
        <div>
          <span style={{ fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: pal.accent }}>{label}</span>
          <p style={{ fontSize: 12, color: pal.ink, opacity: 0.6, margin: "4px 0 6px" }}>{caption}</p>
          <p style={{ fontSize: 12.5, color: pal.ink, opacity: 0.7, margin: 0, lineHeight: 1.6 }}>{cta}</p>
        </div>
        <button
          onClick={() => setCompact(v => !v)}
          style={{
            background: "none", border: `1px solid ${pal.ink}40`,
            color: pal.ink, cursor: "pointer", padding: "6px 10px",
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 11, whiteSpace: "nowrap", flexShrink: 0,
          }}
        >
          {compact ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
          {compact ? fullViewLabel : focusViewLabel}
        </button>
      </div>

      {compact ? (
        /* Focus View */
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          {/* Minimap */}
          <div style={{ flexShrink: 0, width: 120 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, marginBottom: 10 }}>
              {Array.from({ length: 3 }).map((_, br) =>
                Array.from({ length: 3 }).map((_, bc) => {
                  const isFocused = br === fbr && bc === fbc;
                  const isCenter = br === 1 && bc === 1;
                  return (
                    <button
                      key={`${br}-${bc}`}
                      onClick={() => setFocusBlock([br, bc])}
                      style={{
                        aspectRatio: "1/1",
                        background: isFocused ? pal.accent : isCenter ? pal.accent + "33" : pal.accent + "0a",
                        border: isFocused || isCenter ? `2px solid ${pal.accent}` : `1px solid ${pal.ink}25`,
                        cursor: "pointer",
                        borderRadius: 2,
                        position: "relative",
                      }}
                    >
                      {isCenter && !isFocused && (
                        <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 5, height: 5, borderRadius: "50%", background: pal.ink }} />
                      )}
                    </button>
                  );
                })
              )}
            </div>
            <div style={{ fontSize: 10.5, opacity: 0.65, color: pal.ink, fontWeight: 700, textTransform: "uppercase", lineHeight: 1.4, wordBreak: "break-word" }}>
              {grid[fbr * 3 + 1][fbc * 3 + 1]}
            </div>
          </div>

          {/* Selected 3×3 block */}
          <div style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridAutoRows: "110px",
            gap: 3,
            background: pal.ink + "33",
            padding: 3,
            border: `2px solid ${pal.ink}55`,
          }}>
            {Array.from({ length: 3 }).map((_, cr) =>
              Array.from({ length: 3 }).map((_, cc) => {
                const r = fbr * 3 + cr, c = fbc * 3 + cc;
                return (
                  <div key={`${r}-${c}`} style={{ background: pal.bg }}>
                    <CellBox cell={grid[r][c]} isMain={MAIN(r, c)} isSub={SUBGOAL(r, c)} pal={pal} big />
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Full Grid View */
        <div style={{ overflowX: "auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 5,
            background: pal.ink + "55",
            padding: 4,
            minWidth: 560,
            outline: `2px solid ${pal.ink}66`,
          }}>
            {Array.from({ length: 3 }).map((_, br) =>
              Array.from({ length: 3 }).map((_, bc) => (
                <div
                  key={`${br}-${bc}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gridAutoRows: "62px",
                    gap: 2,
                    background: pal.ink + "44",
                  }}
                >
                  {Array.from({ length: 3 }).map((_, cr) =>
                    Array.from({ length: 3 }).map((_, cc) => {
                      const r = br * 3 + cr, c = bc * 3 + cc;
                      return (
                        <div key={`${r}-${c}`} style={{ background: pal.bg, overflow: "hidden" }}>
                          <CellBox cell={grid[r][c]} isMain={MAIN(r, c)} isSub={SUBGOAL(r, c)} pal={pal} />
                        </div>
                      );
                    })
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
