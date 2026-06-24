import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

function emptyGrid() {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => ""));
}

// The single source of truth for one mandalart: loads its title,
// visibility, and 81 cells from Supabase, and exposes update*()
// functions that update local state instantly and flush debounced
// writes back to the database. Works for both the owner (editable)
// and a viewer (call update* less — the UI layer decides what's
// reachable, RLS decides what's actually allowed to write).
function emptyBool() {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => false));
}

export function useMandalart(mandalartId) {
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [grid, setGrid] = useState(null);
  const [descriptions, setDescriptions] = useState(null);
  const [completed, setCompleted] = useState(null);
  const [saveState, setSaveState] = useState("saved"); // "saved" | "unsaved" | "saving"

  // Refs mirror the latest grid/description state so a debounced flush
  // always sends a cell's full current content + description, even if
  // only one of the two fields actually changed.
  const gridRef = useRef(null);
  const descRef = useRef(null);
  const compRef = useRef(null);
  const pendingCellKeys = useRef(new Set());
  const cellFlushTimer = useRef(null);
  const titleFlushTimer = useRef(null);
  const pendingTitleRef = useRef(null);

  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { descRef.current = descriptions; }, [descriptions]);
  useEffect(() => { compRef.current = completed; }, [completed]);

  useEffect(() => {
    if (!mandalartId) return;
    let cancelled = false;
    (async () => {
      const [{ data: meta, error: metaErr }, { data: cells, error: cellsErr }] = await Promise.all([
        supabase.from("mandalarts").select("title, is_public, completed_cells").eq("id", mandalartId).single(),
        supabase.from("mandalart_cells").select("row, col, content, description").eq("mandalart_id", mandalartId),
      ]);
      if (cancelled) return;
      if (metaErr) console.error(metaErr);
      if (cellsErr) console.error(cellsErr);
      const completedMap = meta?.completed_cells || {};
if (meta) {
        setTitle(meta.title);
        setIsPublic(meta.is_public);
      }
      const g = emptyGrid();
      const d = emptyGrid();
      const comp = emptyBool();
      (cells || []).forEach((cell) => {
        g[cell.row][cell.col] = cell.content;
        d[cell.row][cell.col] = cell.description ?? "";
        comp[cell.row][cell.col] = completedMap[`${cell.row}-${cell.col}`] ?? false;
      });
      setGrid(g);
      setDescriptions(d);
      setCompleted(comp);
    })();
    return () => { cancelled = true; };
  }, [mandalartId]);

  const flushCells = useCallback(async () => {
    if (pendingCellKeys.current.size === 0) return;
    setSaveState("saving");
    const rows = Array.from(pendingCellKeys.current).map((key) => {
      const [row, col] = key.split("-").map(Number);
      return {
        mandalart_id: mandalartId,
        row,
        col,
        content: gridRef.current[row][col],
        description: descRef.current[row][col],
      };
    });
    pendingCellKeys.current.clear();
    const { error } = await supabase
      .from("mandalart_cells")
      .upsert(rows, { onConflict: "mandalart_id,row,col" });
    setSaveState(error ? "unsaved" : "saved");
    if (error) console.error(error);
  }, [mandalartId]);

  const queueCell = useCallback((r, c) => {
    pendingCellKeys.current.add(`${r}-${c}`);
    setSaveState("unsaved");
    clearTimeout(cellFlushTimer.current);
    cellFlushTimer.current = setTimeout(flushCells, 800);
  }, [flushCells]);

  const updateCell = useCallback((r, c, content) => {
    setGrid((g) => {
      const next = g.map((row) => row.slice());
      next[r][c] = content;
      return next;
    });
    queueCell(r, c);
    // Keep title in sync with the main goal cell
    if (r === 4 && c === 4) {
      const next = content.trim();
      setTitle(next);
      pendingTitleRef.current = next;
      setSaveState("unsaved");
      clearTimeout(titleFlushTimer.current);
      titleFlushTimer.current = setTimeout(async () => {
        pendingTitleRef.current = null;
        const { error } = await supabase.from("mandalarts").update({ title: next }).eq("id", mandalartId);
        if (error) console.error(error);
      }, 800);
    }
  }, [queueCell, mandalartId]);

  const updateDescription = useCallback((r, c, description) => {
    setDescriptions((d) => {
      const next = d.map((row) => row.slice());
      next[r][c] = description;
      return next;
    });
    queueCell(r, c);
  }, [queueCell]);

  const toggleCompleted = useCallback((r, c) => {
    const base = compRef.current || emptyBool();
    const newVal = !(base[r]?.[c] ?? false);

    // Update compRef synchronously so the map below sees the new value
    const next = base.map((row) => row.slice());
    next[r][c] = newVal;
    compRef.current = next;
    setCompleted(next);

    const updatedMap = {};
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (next[row][col]) updatedMap[`${row}-${col}`] = true;
      }
    }
    supabase
      .from("mandalarts")
      .update({ completed_cells: updatedMap })
      .eq("id", mandalartId)
      .then(({ error }) => {
        if (error) console.error(error);
      });
  }, [mandalartId]);

  const swapBlocks = useCallback((r1, c1, r2, c2) => {
    // r1,c1 and r2,c2 are header cell coords (rows/cols 3-5, not 4,4)
    const br1 = r1 - 3, bc1 = c1 - 3;
    const br2 = r2 - 3, bc2 = c2 - 3;

    const curGrid = gridRef.current;
    const curDesc = descRef.current;
    const curComp = compRef.current || emptyBool();

    const newGrid = curGrid.map((row) => row.slice());
    const newDesc = curDesc.map((row) => row.slice());
    const newComp = curComp.map((row) => row.slice());

    for (let cr = 0; cr < 3; cr++) {
      for (let cc = 0; cc < 3; cc++) {
        const [ar, ac] = [br1 * 3 + cr, bc1 * 3 + cc];
        const [dr, dc] = [br2 * 3 + cr, bc2 * 3 + cc];
        [newGrid[ar][ac], newGrid[dr][dc]] = [newGrid[dr][dc], newGrid[ar][ac]];
        [newDesc[ar][ac], newDesc[dr][dc]] = [newDesc[dr][dc], newDesc[ar][ac]];
        [newComp[ar][ac], newComp[dr][dc]] = [newComp[dr][dc], newComp[ar][ac]];
      }
    }
    [newGrid[r1][c1], newGrid[r2][c2]] = [newGrid[r2][c2], newGrid[r1][c1]];
    [newDesc[r1][c1], newDesc[r2][c2]] = [newDesc[r2][c2], newDesc[r1][c1]];
    [newComp[r1][c1], newComp[r2][c2]] = [newComp[r2][c2], newComp[r1][c1]];

    gridRef.current = newGrid;
    descRef.current = newDesc;
    compRef.current = newComp;
    setGrid(newGrid);
    setDescriptions(newDesc);
    setCompleted(newComp);

    setSaveState("saving");

    const affectedKeys = new Set();
    for (let cr = 0; cr < 3; cr++) {
      for (let cc = 0; cc < 3; cc++) {
        affectedKeys.add(`${br1 * 3 + cr}-${bc1 * 3 + cc}`);
        affectedKeys.add(`${br2 * 3 + cr}-${bc2 * 3 + cc}`);
      }
    }
    affectedKeys.add(`${r1}-${c1}`);
    affectedKeys.add(`${r2}-${c2}`);

    const rows = Array.from(affectedKeys).map((key) => {
      const [row, col] = key.split("-").map(Number);
      return { mandalart_id: mandalartId, row, col, content: newGrid[row][col], description: newDesc[row][col] };
    });

    const updatedMap = {};
    for (let row = 0; row < 9; row++)
      for (let col = 0; col < 9; col++)
        if (newComp[row][col]) updatedMap[`${row}-${col}`] = true;

    Promise.all([
      supabase.from("mandalart_cells").upsert(rows, { onConflict: "mandalart_id,row,col" }),
      supabase.from("mandalarts").update({ completed_cells: updatedMap }).eq("id", mandalartId),
    ]).then(([{ error: e1 }, { error: e2 }]) => {
      if (e1 || e2) { console.error(e1, e2); setSaveState("unsaved"); }
      else setSaveState("saved");
    });
  }, [mandalartId]);

  const updateTitle = useCallback((text) => {
    setTitle(text);
    pendingTitleRef.current = text;
    setSaveState("unsaved");
    clearTimeout(titleFlushTimer.current);
    titleFlushTimer.current = setTimeout(async () => {
      pendingTitleRef.current = null;
      setSaveState("saving");
      const { error } = await supabase.from("mandalarts").update({ title: text }).eq("id", mandalartId);
      setSaveState(error ? "unsaved" : "saved");
      if (error) console.error(error);
    }, 800);
  }, [mandalartId]);

  const updateVisibility = useCallback(async (nextIsPublic) => {
    setIsPublic(nextIsPublic);
    setSaveState("saving");
    const { error } = await supabase.from("mandalarts").update({ is_public: nextIsPublic }).eq("id", mandalartId);
    setSaveState(error ? "unsaved" : "saved");
    if (error) console.error(error);
  }, [mandalartId]);

  const saveNow = useCallback(async () => {
    clearTimeout(cellFlushTimer.current);
    clearTimeout(titleFlushTimer.current);
    setSaveState("saving");
    const flushTitle = pendingTitleRef.current !== null
      ? supabase.from("mandalarts").update({ title: pendingTitleRef.current }).eq("id", mandalartId).then(({ error }) => { if (error) console.error(error); })
      : Promise.resolve();
    pendingTitleRef.current = null;
    await Promise.all([flushCells(), flushTitle]);
    setSaveState("saved");
  }, [flushCells, mandalartId]);

  // Flush immediately on unmount so nothing is lost on navigation.
  useEffect(() => () => { flushCells(); }, [flushCells]);

  return { title, isPublic, grid, descriptions, completed, updateTitle, updateVisibility, updateCell, updateDescription, toggleCompleted, swapBlocks, saveState, saveNow };
}

// Subscribe to live changes on a mandalart's cells — the seed for
// Phase 3 real-time collaboration. Not called anywhere yet; wire it
// in once collaborator editing UI exists.
export function useMandalartRealtime(mandalartId, onCellChange) {
  useEffect(() => {
    if (!mandalartId) return;
    const channel = supabase
      .channel(`mandalart:${mandalartId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "mandalart_cells", filter: `mandalart_id=eq.${mandalartId}` },
        (payload) => onCellChange?.(payload.new)
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [mandalartId, onCellChange]);
}
