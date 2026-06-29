import { supabase } from "../lib/supabaseClient";

export async function pushPomodoroRecords(userId, records) {
  const { error } = await supabase
    .from("pomodoro_records")
    .upsert({ user_id: userId, records, synced_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function pullPomodoroRecords(userId) {
  const { data, error } = await supabase
    .from("pomodoro_records")
    .select("records, synced_at")
    .eq("user_id", userId)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}
