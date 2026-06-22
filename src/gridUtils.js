export function emptyGrid() {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => ""));
}

export function isHeaderCell(r, c) {
  return r >= 3 && r <= 5 && c >= 3 && c <= 5 && !(r === 4 && c === 4);
}

export function isOuterCenterCell(r, c) {
  return r % 3 === 1 && c % 3 === 1 && !(r === 4 && c === 4);
}

export function headerToBlock(r, c) {
  const br = r - 3, bc = c - 3;
  return [br * 3 + 1, bc * 3 + 1];
}

export function blockToHeader(r, c) {
  const br = Math.floor(r / 3), bc = Math.floor(c / 3);
  return [3 + br, 3 + bc];
}

export function blockLabel(grid, br, bc, t) {
  const centerVal = grid[br * 3 + 1][bc * 3 + 1];
  return centerVal || t.grid.detail;
}

// Returns true when all 8 detail cells in the outer block (br, bc) are completed
export function isBlockAllDone(br, bc, completed) {
  if (!completed) return false;
  for (let cr = 0; cr < 3; cr++) {
    for (let cc = 0; cc < 3; cc++) {
      if (cr === 1 && cc === 1) continue;
      if (!completed[br * 3 + cr][bc * 3 + cc]) return false;
    }
  }
  return true;
}
