import React, { useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

const GRID_KO = [
  ["몸을 건강한\n상태로 유지한다",  "영양제를\n꾸준히 먹는다",        "FSQ 90kg를 든다",               "인스텝을\n개선한다",             "몸의 코어를\n강화한다",          "몸의 축이\n흔들리지 않도록 한다", "던지는 각도를\n만든다",          "위에서부터\n공을 던진다",        "손목을 강화한다"],
  ["유연성을 키운다",               "몸을 만든다",                    "RSQ 130kg를 든다",              "릴리즈 포인트를\n안정시킨다",   "제구력을 높인다",                "불안정함을 없앤다",               "힘을 모아\n피칭한다",            "구위를 높인다",                  "하반신으로\n투구를 리드한다"],
  ["스태미나를 키운다",             "가동 범위를\n넓힌다",            "식사량을\n적정 수준으로\n고정한다", "하체를 강화한다",              "몸을 열지 않는다",               "멘탈을\n컨트롤한다",              "볼을 앞에서\n릴리즈한다",        "회전수를 늘린다",                "가동력을 키운다"],
  ["뚜렷한 목표를\n세운다",         "일희일비하지\n않는다",           "머리는 차갑게,\n심장은 뜨겁게\n임한다", "몸을 만든다",               "제구력을 높인다",                "구위를 높인다",                   "축을 돌린다",                    "하체를 강화한다",                "체중을 늘린다"],
  ["핀치에 강하게\n임한다",         "정신력을 강화한다",              "분위기에\n휩쓸리지 않는다",    "정신력을 강화한다",              "8구단\n드래프트\n1순위가 된다",  "스피드\n160km/h를 던진다",       "몸통을 강화한다",                "스피드\n160km/h를 던진다",       "어깨 주변을\n강화한다"],
  ["마음의 파도를\n만들지 않는다",  "승리를 향한\n집념을 불태운다",  "동료를 항상\n배려한다",         "인간성을 갖춘다",                "운을 쌓는다",                    "변화구를\n마스터한다",            "가동력을 키운다",                "라이너 캐치볼을\n한다",          "피칭량을 늘린다"],
  ["공감 능력을\n키운다",           "사랑받는\n사람이 된다",          "계획적으로\n행동한다",          "먼저 인사한다",                  "쓰레기를 줍는다",                "더그아웃과\n락커룸을 청소한다",  "카운트볼을\n늘린다",             "포크볼을\n완성한다",             "슬라이더\n구위를 높인다"],
  ["배려하며\n행동한다",            "인간성을 갖춘다",                "감사함을\n표현한다",            "물건을 소중히\n쓴다",            "운을 쌓는다",                    "심판을 존중한다",                 "낙차 큰 커브를\n던진다",         "변화구를\n마스터한다",           "좌타자 결정구를\n완성한다"],
  ["예의를 지킨다",                 "신뢰받는\n사람이 된다",          "꾸준히 지속한다",               "긍정적으로\n생각한다",           "응원받는\n사람이 된다",          "책을 읽는다",                     "직구와 같은\n폼으로 던진다",    "스트라이크\n제구력을 높인다",    "거리를 명확히\n상상한다"],
];

const GRID_EN = [
  ["Keep my body\nin peak condition", "Take supplements\nconsistently",  "Lift FSQ 90kg",             "Improve\ninStep form",         "Strengthen\nmy core",        "Keep my body\naxis stable",  "Create\nthrowing angle",         "Throw from\nabove",           "Strengthen\nwrists"],
  ["Build flexibility",               "Build my body",                   "Lift RSQ 130kg",            "Stabilize\nrelease point",    "Master control",             "Eliminate\ninstability",     "Channel power\ninto each pitch", "Elevate\npitch quality",      "Lead with\nlower body"],
  ["Build stamina",                   "Expand range\nof motion",         "Maintain\nconsistent\nmeal portions", "Strengthen legs", "Keep body\nclosed",          "Control\nmental state",      "Release ball\nout front",        "Increase\nspin rate",         "Improve mobility"],
  ["Set clear goals",                 "Avoid emotional\nswings",         "Stay cool-headed,\nwarm-hearted",   "Build my body",  "Master control",             "Elevate\npitch quality",     "Rotate the axis",                "Strengthen legs",             "Gain weight"],
  ["Stay strong\nunder pressure",     "Strengthen\nmental fortitude",   "Resist the\natmosphere",    "Strengthen\nmental fortitude",  "Become draft #1\nby all 8 teams", "Throw\n160km/h",    "Strengthen core",                "Throw\n160km/h",              "Strengthen\nshoulders"],
  ["Keep composure\nalways",          "Pursue victory\nrelentlessly",   "Care for\nteammates always", "Build character",               "Cultivate luck",             "Master\nbreaking balls",    "Improve mobility",               "Practice\nliner catches",     "Increase\npitching reps"],
  ["Develop empathy",                 "Be someone\npeople love",        "Plan deliberately",          "Greet\neveryone first",         "Pick up trash",              "Clean the dugout\n& locker room", "Increase\ncount pitches",   "Perfect the\nfork ball",      "Improve\nslider quality"],
  ["Show consideration",              "Build character",                "Express gratitude",          "Treat things\nwith care",       "Cultivate luck",             "Respect\numpires always",   "Develop\nlate-drop curve",       "Master\nbreaking balls",      "Develop lefty\nout-pitch"],
  ["Practice etiquette",              "Earn people's\ntrust",           "Persist every day",          "Think positively",              "Be someone\nworth cheering",  "Read books\nregularly",    "Match fastball\nform",           "Control\nstrike pitches",     "Visualize the\ndistance clearly"],
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
  const isKo = t.mandalartAbout.ohtaniLabel === "오타니 방식";
  const grid = isKo ? GRID_KO : GRID_EN;
  const [compact, setCompact] = useState(false);
  const [focusBlock, setFocusBlock] = useState([1, 1]);
  const [fbr, fbc] = focusBlock;

  const label = t.mandalartAbout.ohtaniGridLabel;
  const caption = t.mandalartAbout.ohtaniGridCaption;
  const cta = t.mandalartAbout.ohtaniGridCta;
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
