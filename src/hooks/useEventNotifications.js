import { useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

const COLS = 6; // 10-min slots per hour

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback; } catch { return fallback; }
}

function timeToCell(hhmm) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  return h * COLS + Math.floor(m / 10);
}

function tryNotif(title, body) {
  try { new Notification(title, { body }); } catch (_) {}
}

export function useEventNotifications(enabled, userId, t) {
  const fired = useRef(new Set());
  const groupEventsRef = useRef([]);

  // Fetch today's visible group events, refresh every 30 min
  useEffect(() => {
    if (!enabled || !userId) return;

    const fetch = async () => {
      try {
        const today = todayKey();
        const { data: events } = await supabase
          .from("group_events")
          .select("id, title, start_time, creator_id")
          .eq("date", today);
        if (!events?.length) { groupEventsRef.current = []; return; }

        const notMine = events.filter(e => e.creator_id !== userId);
        let acceptedIds = new Set();
        if (notMine.length) {
          const { data: invites } = await supabase
            .from("group_event_invites")
            .select("event_id")
            .eq("invitee_id", userId)
            .eq("status", "accepted")
            .in("event_id", notMine.map(e => e.id));
          (invites ?? []).forEach(i => acceptedIds.add(i.event_id));
        }
        groupEventsRef.current = events.filter(e =>
          e.creator_id === userId || acceptedIds.has(e.id)
        );
      } catch (_) {}
    };

    fetch();
    const id = setInterval(fetch, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, [enabled, userId]);

  // Polling loop: check start times and 10-min warnings
  useEffect(() => {
    if (!enabled || !userId) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

    const p = t.planner;

    const check = () => {
      const today = todayKey();
      const now = new Date();
      const curCell = now.getHours() * COLS + Math.floor(now.getMinutes() / 10);

      const events    = load(`grida_daily_${userId}_${today}`, {}).events ?? [];
      const calEvents = load(`grida_calendar_${userId}`, {})[today] ?? [];
      const dow       = now.getDay();
      const recurring = load(`grida_recurring_${userId}`, [])
        .filter(r => Array.isArray(r.days) && r.days.includes(dow))
        .map(r => ({ ...r, id: `recur_${r.id}` }));
      const groupEvents = groupEventsRef.current;

      // Personal events: fire at start
      for (const evt of [...events, ...calEvents, ...recurring]) {
        if (evt.startCell !== curCell) continue;
        const tag = `start_${evt.id}_${today}_${curCell}`;
        if (fired.current.has(tag)) continue;
        fired.current.add(tag);
        tryNotif(p.notifStartTitle, p.notifStartBody(evt.title));
      }

      // Personal events: 10-min warning
      for (const evt of [...events, ...calEvents, ...recurring]) {
        if (evt.startCell !== curCell + 1) continue;
        const tag = `warn_${evt.id}_${today}_${curCell}`;
        if (fired.current.has(tag)) continue;
        fired.current.add(tag);
        tryNotif(p.notifWarnTitle, p.notifWarnBody(evt.title));
      }

      // Group events: fire at start
      for (const ge of groupEvents) {
        const sc = timeToCell(ge.start_time);
        if (sc === null || sc !== curCell) continue;
        const tag = `gestart_${ge.id}_${today}`;
        if (fired.current.has(tag)) continue;
        fired.current.add(tag);
        tryNotif(p.notifStartTitle, p.notifStartBody(ge.title));
      }

      // Group events: 10-min warning
      for (const ge of groupEvents) {
        const sc = timeToCell(ge.start_time);
        if (sc === null || sc !== curCell + 1) continue;
        const tag = `gewarn_${ge.id}_${today}_${curCell}`;
        if (fired.current.has(tag)) continue;
        fired.current.add(tag);
        tryNotif(p.notifWarnTitle, p.notifWarnBody(ge.title));
      }
    };

    check();
    const id = setInterval(check, 20000);
    return () => clearInterval(id);
  }, [enabled, userId, t]);
}
