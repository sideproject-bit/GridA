import { supabase } from "../lib/supabaseClient";

export async function pushPlannerSync(userId, data) {
  const { error } = await supabase
    .from("planner_sync")
    .upsert({ user_id: userId, data, synced_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function pullPlannerSync(userId) {
  const { data, error } = await supabase
    .from("planner_sync")
    .select("data, synced_at")
    .eq("user_id", userId)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

export async function pushPlannerSyncHistory(userId, data) {
  await supabase.from("planner_sync_history").insert({ user_id: userId, data });
  // Keep only last 30 snapshots per user
  const { data: rows } = await supabase
    .from("planner_sync_history")
    .select("id")
    .eq("user_id", userId)
    .order("saved_at", { ascending: false });
  if (rows && rows.length > 30) {
    const toDelete = rows.slice(30).map(r => r.id);
    await supabase.from("planner_sync_history").delete().in("id", toDelete);
  }
}

export async function listPlannerSyncHistory(userId) {
  const { data, error } = await supabase
    .from("planner_sync_history")
    .select("id, saved_at, data")
    .eq("user_id", userId)
    .order("saved_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return data ?? [];
}
