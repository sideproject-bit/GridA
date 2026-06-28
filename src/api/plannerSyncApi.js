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
    if (error.code === "PGRST116") return null; // no rows found
    throw error;
  }
  return data;
}
