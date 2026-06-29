import { supabase } from "../lib/supabaseClient";

export async function sendContactMessage(userId, subject, message) {
  const { data, error } = await supabase
    .from("contact_messages")
    .insert({ user_id: userId, subject, message })
    .select()
    .single();
  return { data, error };
}

export async function getContactMessages(userId) {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function getAllContactMessages() {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function replyToContactMessage(id, adminReply) {
  const { error } = await supabase
    .from("contact_messages")
    .update({ admin_reply: adminReply, status: "replied", replied_at: new Date().toISOString() })
    .eq("id", id);
  return { error };
}

export async function sendEmailNotification({ fromName, fromEmail, subject, message }) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  if (!serviceId || !templateId || !publicKey) return;
  try {
    await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: { from_name: fromName, from_email: fromEmail, subject, message },
      }),
    });
  } catch {}
}
