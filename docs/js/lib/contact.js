// The contact form posts its message to the Supabase Edge Function "contact"
// (supabase/functions/contact/index.js), which emails it to us and keeps a copy.
export const CONTACT_EMAIL = "eirehomeflow@gmail.com";

export const contactUrl = (supabaseUrl) => (supabaseUrl ? supabaseUrl.replace(/\/+$/, "") + "/functions/v1/contact" : "");

// What the form sends: the fields trimmed, the hidden field only bots fill in, and the page's language.
export function contactBody({ name = "", email = "", topic = "", message = "", website = "" }, locale) {
  return { name: name.trim(), email: email.trim(), topic, message: message.trim(), website, locale };
}

// "sent", "tooMany" (too many messages from this address in the last hour) or "failed".
export function sendOutcome(status) {
  if (status >= 200 && status < 300) return "sent";
  return status === 429 ? "tooMany" : "failed";
}
