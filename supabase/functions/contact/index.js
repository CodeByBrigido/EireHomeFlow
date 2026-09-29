// Supabase Edge Function "contact": receives the Contact us form (docs/contact.html), emails the
// message to us through Resend, with Reply-To set to the sender, and keeps a copy in the table
// public.contact_messages. Setup (table, deploy, the RESEND_API_KEY secret): specs/SETUP-CONTAS.md,
// section 8. Deploy with "Verify JWT" switched off: the site calls it with the publishable key.
//
// Plain JavaScript on purpose: the same file is pasted into the dashboard editor (index.ts) and
// tested in Node (tests/contact-function.test.js), where Deno does not exist and nothing is served.

export const TO = "eirehomeflow@gmail.com";
// Without a verified domain, Resend sends only from this address and only to the account's own email.
export const FROM = "ÉireHome Flow <onboarding@resend.dev>";
export const TOPICS = {
  guide: "A question about the guide",
  calculator: "The calculator",
  account: "My account",
  correction: "A figure or fact to correct",
  idea: "An idea for the site",
  misc: "Something else",
};
export const LIMITS = { name: 80, email: 254, message: 1500 };
export const PER_HOUR = 5; // messages from one IP address in an hour

const ORIGINS = [/^https:\/\/codebybrigido\.github\.io$/, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOCALE = /^[a-z]{2,3}(-[A-Z]{2})?$/;

// Control characters have no place in a name; a message may have line breaks and tabs.
function hasControl(text, lineBreaks) {
  return [...text].some((c) => {
    const code = c.charCodeAt(0);
    if (lineBreaks && (c === "\n" || c === "\r" || c === "\t")) return false;
    return code < 32 || code === 127;
  });
}

// The form's fields, trimmed and checked, or null when something is missing or wrong.
export function checkMessage(body) {
  if (!body || typeof body !== "object") return null;
  const text = (key) => (typeof body[key] === "string" ? body[key].trim() : "");
  const values = { name: text("name"), email: text("email"), topic: text("topic"), message: text("message"), locale: text("locale") };
  if (!LOCALE.test(values.locale)) values.locale = "";
  const ok = values.name && values.name.length <= LIMITS.name && !hasControl(values.name, false)
    && values.email.length <= LIMITS.email && EMAIL.test(values.email)
    && Object.hasOwn(TOPICS, values.topic)
    && values.message && values.message.length <= LIMITS.message && !hasControl(values.message, true);
  return ok ? values : null;
}

// The email we receive. Replying to it answers the person who wrote.
export function emailFor(values, when) {
  const topic = TOPICS[values.topic];
  return {
    from: FROM,
    to: [TO],
    reply_to: values.email,
    subject: `Contact form: ${topic} (${values.name})`,
    text: [
      values.message,
      "",
      "---",
      `From: ${values.name} <${values.email}>`,
      `Topic: ${topic}`,
      `Site language: ${values.locale || "unknown"}`,
      `Sent: ${when.toISOString()}`,
    ].join("\n"),
  };
}

// The IP address is kept only as an HMAC, to count messages per hour without storing the address.
export async function hmac(secret, text) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(text)));
  return [...signature].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

const allowed = (origin) => ORIGINS.some((pattern) => pattern.test(origin));
const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  Vary: "Origin",
});

// services: { now(), hash(ip), recentFrom(ipHash, since) → count, send(email), save(row) }.
// Answers 200 { ok } once the message was emailed or saved, 400 for a wrong form, 429 after
// PER_HOUR messages from the same address, 502 when neither the email nor the copy worked.
export async function handle(request, services) {
  const origin = request.headers.get("origin") || "";
  if (!allowed(origin)) return new Response("Forbidden", { status: 403 });
  const headers = corsHeaders(origin);
  const reply = (status, body) => new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return reply(405, { error: "method" });

  let body = null;
  try { body = await request.json(); } catch (err) { /* not JSON: checkMessage says no */ }
  // Only a bot fills in the hidden "website" field: thank it and drop the message.
  if (body && typeof body.website === "string" && body.website) return reply(200, { ok: true });
  const values = checkMessage(body);
  if (!values) return reply(400, { error: "invalid" });

  const now = services.now();
  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  const ipHash = ip ? await services.hash(ip) : null;
  if (ipHash) {
    try {
      if (await services.recentFrom(ipHash, new Date(now.getTime() - 3600 * 1000)) >= PER_HOUR) return reply(429, { error: "tooMany" });
    } catch (err) {
      console.error("contact: could not count recent messages", err);
    }
  }

  const emailed = await services.send(emailFor(values, now)).then(() => true, (err) => { console.error("contact: email failed", err); return false; });
  const saved = await services.save({ ...values, ip_hash: ipHash, emailed }).then(() => true, (err) => { console.error("contact: save failed", err); return false; });
  return emailed || saved ? reply(200, { ok: true }) : reply(502, { error: "failed" });
}

// The real services, from the function's environment. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
// are set by Supabase; RESEND_API_KEY is the secret added in the dashboard.
function supabaseServices(env) {
  const key = env.get("SUPABASE_SERVICE_ROLE_KEY");
  const table = `${env.get("SUPABASE_URL")}/rest/v1/contact_messages`;
  const database = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  const checked = async (response) => {
    if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
    return response;
  };
  return {
    now: () => new Date(),
    hash: (ip) => hmac(key, ip),
    recentFrom: async (ipHash, since) => {
      const query = `?select=id&ip_hash=eq.${encodeURIComponent(ipHash)}&created_at=gte.${encodeURIComponent(since.toISOString())}&limit=${PER_HOUR}`;
      return (await (await checked(await fetch(table + query, { headers: database }))).json()).length;
    },
    save: async (row) => checked(await fetch(table, { method: "POST", headers: { ...database, Prefer: "return=minimal" }, body: JSON.stringify(row) })),
    send: async (email) => {
      const resendKey = env.get("RESEND_API_KEY");
      if (!resendKey) throw new Error("the RESEND_API_KEY secret is not set");
      return checked(await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(email),
      }));
    },
  };
}

if (typeof Deno !== "undefined") Deno.serve((request) => handle(request, supabaseServices(Deno.env)));
