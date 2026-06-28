import { supabase } from "../lib/supabaseClient";

export async function fetchGroupEventsForUser(myId) {
  const { data: events, error } = await supabase
    .from("group_events")
    .select("*")
    .order("date", { ascending: true });
  if (error) throw error;
  if (!events?.length) return [];

  const groupIds = [...new Set(events.filter(e => e.group_id).map(e => e.group_id))];
  const creatorIds = [...new Set(events.map(e => e.creator_id))];

  const [groupsRes, profilesRes] = await Promise.all([
    groupIds.length
      ? supabase.from("groups").select("id, name, admin_id").in("id", groupIds)
      : Promise.resolve({ data: [] }),
    creatorIds.length
      ? supabase.from("profiles").select("id, username").in("id", creatorIds)
      : Promise.resolve({ data: [] }),
  ]);

  const groupMap = Object.fromEntries((groupsRes.data ?? []).map(g => [g.id, g]));
  const profileMap = Object.fromEntries((profilesRes.data ?? []).map(p => [p.id, p]));

  return events.map(e => ({
    ...e,
    _groupLabel: e.group_id
      ? `[${groupMap[e.group_id]?.name ?? "Group"}]`
      : `[${profileMap[e.creator_id]?.username ?? "?"}]`,
    _isAdmin: e.group_id
      ? groupMap[e.group_id]?.admin_id === myId
      : e.creator_id === myId,
  }));
}

export async function addGroupEvent({ groupId, receiverId, creatorId, title, date, startTime, endTime, color, memo }) {
  const payload = {
    creator_id: creatorId,
    title,
    date,
    start_time: startTime || null,
    end_time: endTime || null,
    color: color || "#4A90D9",
    memo: memo || null,
  };
  if (groupId) payload.group_id = groupId;
  if (receiverId) payload.receiver_id = receiverId;

  const { data, error } = await supabase
    .from("group_events")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteGroupEvent(eventId) {
  const { error } = await supabase.from("group_events").delete().eq("id", eventId);
  if (error) throw error;
}
