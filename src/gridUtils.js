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
