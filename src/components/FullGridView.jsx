import React from "react";
import Cell from "./Cell";
import { isHeaderCell, isOuterCenterCell, isBlockAllDone } from "../gridUtils";

export default function FullGridView({ grid, descriptions, completed, onChange, onLink, onOpenDesc, onToggleCompleted, pal, t, highlightBlock, readOnly = false }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, background: pal.ink, padding: 6, border: `3px solid ${pal.ink}` }}>
      {Array.from({ length: 3 }).map((_, br) =>
        Array.from({ length: 3 }).map((_, bc) => (
          <div
            key={`${br}-${bc}`}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gridAutoRows: "56px",
              gap: 2,
              background: pal.ink,
              outline: highlightBlock === `${br}-${bc}` ? `3px solid ${pal.accent}` : "none",
              transition: "outline 0.2s",
            }}
          >
            {Array.from({ length: 3 }).map((_, cr) =>
              Array.from({ length: 3 }).map((_, cc) => {
                const r = br * 3 + cr, c = bc * 3 + cc;
                const isHdr = isHeaderCell(r, c);
                const isOC = isOuterCenterCell(r, c);
                const subGoalDone = isHdr
                  ? isBlockAllDone(r - 3, c - 3, completed)
                  : isOC
                  ? isBlockAllDone(Math.floor(r / 3), Math.floor(c / 3), completed)
                  : false;
                return (
                  <div key={`${r}-${c}`} style={{ background: pal.bg, overflow: "hidden" }}>
                    <Cell
                      r={r} c={c}
                      value={grid[r][c]}
                      isMain={r === 4 && c === 4}
                      isHeader={isHdr}
                      isOuterCenter={isOC}
                      onChange={onChange}
                      onLink={onLink}
                      description={descriptions[r][c]}
                      onOpenDesc={onOpenDesc}
                      completed={completed?.[r][c] ?? false}
                      onToggleCompleted={onToggleCompleted}
                      pal={pal}
                      t={t}
                      highlighted={false}
                      readOnly={readOnly}
                      subGoalDone={subGoalDone}
                    />
                  </div>
                );
              })
            )}
          </div>
        ))
      )}
    </div>
  );
}
