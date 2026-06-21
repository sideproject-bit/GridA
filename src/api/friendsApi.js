import { supabase } from "../lib/supabaseClient";

// Exact-match lookup only — backs the "Name#0000" box. Returns
// { id, username, tag } or null. No partial/fuzzy matching by design.
export async function findProfileByCode(code) {
  const { data, error } = await supabase.rpc("find_profile_by_code", { code: code.trim() });
  if (error) {
    console.error(error);
    return null;
  }
  return data?.[0] ?? null;
}

// Looks the code up, checks for the obvious dead ends (self, already
// connected), then inserts a pending friendship row. Returns
// { ok: true, target } or { ok: false, reason } where reason is one
// of "not_found" | "self" | "already" | "error".
export async function sendFriendRequest(myId, code) {
  const target = await findProfileByCode(code);
  if (!target) return { ok: false, reason: "not_found" };
  if (target.id === myId) return { ok: false, reason: "self" };

  const { data: existing } = await supabase
    .from("friendships")
    .select("user_id, friend_id")
    .or(`and(user_id.eq.${myId},friend_id.eq.${target.id}),and(user_id.eq.${target.id},friend_id.eq.${myId})`);
  if (existing && existing.length > 0) return { ok: false, reason: "already" };

  const { error } = await supabase
    .from("friendships")
    .insert({ user_id: myId, friend_id: target.id, status: "pending" });
  if (error) {
    console.error(error);
    return { ok: false, reason: "error" };
  }
  return { ok: true, target };
}

export async function acceptFriendRequest(myId, requesterId) {
  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("user_id", requesterId)
    .eq("friend_id", myId);
  if (error) console.error(error);
  return !error;
}

export async function declineFriendRequest(myId, requesterId) {
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("user_id", requesterId)
    .eq("friend_id", myId);
  if (error) console.error(error);
  return !error;
}

// Incoming requests: rows where someone else added *you* and it's
// still pending. Returns [{ requesterId, username, tag }].
export async function listIncomingRequests(myId) {
  const { data: rows, error } = await supabase
    .from("friendships")
    .select("user_id")
    .eq("friend_id", myId)
    .eq("status", "pending");
  if (error || !rows?.length) return [];

  const ids = rows.map((r) => r.user_id);
  const { data: profiles } = await supabase.from("profiles").select("id, username, tag").in("id", ids);
  return (profiles ?? []).map((p) => ({ requesterId: p.id, username: p.username, tag: p.tag }));
}

// Accepted friends, regardless of who sent the original request.
// Returns [{ id, username, tag }].
export async function listFriends(myId) {
  const { data: rows, error } = await supabase
    .from("friendships")
    .select("user_id, friend_id")
    .eq("status", "accepted")
    .or(`user_id.eq.${myId},friend_id.eq.${myId}`);
  if (error || !rows?.length) return [];

  const otherIds = rows.map((r) => (r.user_id === myId ? r.friend_id : r.user_id));
  const { data: profiles } = await supabase.from("profiles").select("id, username, tag").in("id", otherIds);
  return profiles ?? [];
}
