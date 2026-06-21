import { supabase } from "../lib/supabaseClient";

export async function listMyMandalarts(ownerId) {
  const { data, error } = await supabase
    .from("mandalarts")
    .select("id, title, updated_at, is_public")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function createMandalart(_ownerId, title) {
  const { data, error } = await supabase.rpc("create_mandalart", { p_title: title });
  if (error) {
    console.error(error);
    return null;
  }
  return data;
}

export async function deleteMandalart(id) {
  const { error } = await supabase.from("mandalarts").delete().eq("id", id);
  return !error;
}

// Deliberately the same shape of query as listMyMandalarts, just with
// someone else's id. RLS does the actual filtering — when the caller
// isn't the owner, only is_public rows for an accepted friend come
// back; everything else returns an empty array.
export async function listFriendMandalarts(friendId) {
  const { data, error } = await supabase
    .from("mandalarts")
    .select("id, title, updated_at")
    .eq("owner_id", friendId)
    .order("updated_at", { ascending: false });
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}
