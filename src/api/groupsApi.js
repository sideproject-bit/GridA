import { supabase } from "../lib/supabaseClient";

export async function fetchMyGroups() {
  const { data, error } = await supabase
    .from("groups")
    .select("id, name, admin_id, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createGroup(adminId, name) {
  const { data: group, error } = await supabase
    .from("groups")
    .insert({ name: name.trim(), admin_id: adminId })
    .select()
    .single();
  if (error) throw error;
  await supabase.from("group_members").insert({ group_id: group.id, user_id: adminId });
  return group;
}

export async function inviteMember(groupId, userId) {
  const { error } = await supabase
    .from("group_members")
    .insert({ group_id: groupId, user_id: userId });
  if (error) throw error;
}

export async function leaveGroup(groupId, userId) {
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function deleteGroup(groupId) {
  const { error } = await supabase.from("groups").delete().eq("id", groupId);
  if (error) throw error;
}

export async function transferAdmin(groupId, newAdminId) {
  const { error } = await supabase
    .from("groups")
    .update({ admin_id: newAdminId })
    .eq("id", groupId);
  if (error) throw error;
}

export async function getGroupMembers(groupId) {
  const { data, error } = await supabase.rpc("get_group_members", { p_group_id: groupId });
  if (error) throw error;
  return data ?? [];
}
