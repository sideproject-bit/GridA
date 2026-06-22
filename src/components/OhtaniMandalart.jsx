import React from "react";

// Ohtani Shohei's mandalart from high school (age 16)
// Main goal: 8구단 드래프트 1순위 (Draft #1 pick by all 8 pro teams)
const GRID = [
  ["몸관리",       "영양제 먹기",                 "FSQ 90kg",               "인스텝 개선",         "몸통 강화",        "축 흔들지 않기",   "각도를 만든다",       "위에서부터\n공을 던진다",  "손목 강화"],
  ["유연성",       "몸 만들기",                   "RSQ 130kg",              "릴리즈 포인트\n안정", "제구",             "불안정 없애기",    "힘 모으기",           "구위",              "하반신 주도"],
  ["스테미너",     "가동역",                      "식사\n저녁7순갈\n아침3순갈", "하체 강화",          "몸을 열지 않기",   "멘탈을\n컨트롤",   "볼을\n앞에서 릴리즈", "회전수 증가",       "가동력"],
  ["뚜렷한\n목표·목적", "일희일비\n하지 않기",    "머리는 차갑게\n심장은 뜨겁게", "몸 만들기",        "제구",             "구위",             "축을 돌리기",         "하체 강화",         "체중 증가"],
  ["핀치에\n강하게", "멘탈",                      "분위기에\n휩쓸리지 않기", "멘탈",               "8구단\n드래프트\n1순위", "스피드\n160km/h", "몸통 강화",          "스피드\n160km/h",   "어깨주변\n강화"],
  ["마음의 파도를\n안만들기", "승리에\n대한 집념", "동료를\n배려하는 마음",   "인간성",             "운",               "변화구",           "가동력",              "라이너\n캐치볼",    "피칭 늘리기"],
  ["감성",         "사랑받는\n사람",              "계획성",                  "인사하기",           "쓰레기\n줍기",     "부실 청소",        "카운트볼\n늘리기",    "포크볼 완성",       "슬라이더\n구위"],
  ["배려",         "인간성",                      "감사",                    "물건을\n소중히 쓰자", "운",              "심판을\n대하는 태도", "늦게\n낙차가 있는\n커브", "변화구",         "좌타자\n결정구"],
  ["예의",         "신뢰받는\n사람",              "지속력",                  "긍정적 사고",        "응원받는\n사람",   "책읽기",           "직구와\n같은 폼으로\n던지기", "스트라이크볼을\n던질 때 제구", "거리를\n상상하기"],
];

const MAIN = (r, c) => r === 4 && c === 4;
const SUBGOAL = (r, c) => [1, 4, 7].includes(r) && [1, 4, 7].includes(c) && !MAIN(r, c);

export default function OhtaniMandalart({ pal, t }) {
  const label = t.about.ohtaniGridLabel;
  const caption = t.about.ohtaniGridCaption;
  const cta = t.about.ohtaniGridCta;

  return (
    <div style={{ marginTop: 40 }}>
      <div style={{ borderTop: `3px solid ${pal.ink}`, marginBottom: 16 }} />
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: pal.accent }}>{label}</span>
        <p style={{ fontSize: 12, color: pal.ink, opacity: 0.6, margin: "4px 0 0" }}>{caption}</p>
      </div>

      <p style={{ fontSize: 12.5, color: pal.ink, opacity: 0.7, margin: "0 0 14px", lineHeight: 1.6 }}>
        {cta}
      </p>

      <div style={{ overflowX: "auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(9, 1fr)",
          gridTemplateRows: "repeat(9, 1fr)",
          gap: 2,
          background: pal.ink + "55",
          padding: 3,
          minWidth: 560,
          maxWidth: 820,
          aspectRatio: "1/1",
          outline: `2px solid ${pal.ink}66`,
        }}>
          {GRID.map((row, r) =>
            row.map((cell, c) => {
              const isMain = MAIN(r, c);
              const isSub = SUBGOAL(r, c);

              const bg = isMain
                ? pal.accent
                : isSub
                ? pal.accent2 + "44"
                : pal.accent3 + "18";

              const border = isMain
                ? `1px solid ${pal.accent}`
                : isSub
                ? `1px solid ${pal.accent2}66`
                : `1px solid ${pal.accent3}28`;

              return (
                <div
                  key={`${r}-${c}`}
                  style={{
                    background: bg,
                    border,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 2,
                  }}
                >
                  <span style={{
                    fontSize: isMain ? 9 : 7.5,
                    fontWeight: isMain ? 800 : isSub ? 700 : 500,
                    color: isMain ? "#fff" : pal.ink,
                    textAlign: "center",
                    lineHeight: 1.35,
                    wordBreak: "keep-all",
                    whiteSpace: "pre-wrap",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                    opacity: isMain ? 1 : isSub ? 0.95 : 0.82,
                  }}>
                    {cell}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
