// Accounts: Supabase sign-up and sign-in, and reading and writing the progress row (merging is in sync.js).
// Settings come from config.js. With them empty, Account.enabled stays false
// and the Supabase library is never downloaded.
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../config.js?v=20261006";

const SUPABASE_JS = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
const CONFIGURED = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// Coming back from an email link (sign-up confirmation, password reset): only Supabase can
// tell who this is, so the header waits for it. Every other visit can be drawn at once.
const RETURNING = /(^|&)(access_token|error_code|type)=/.test(location.hash.slice(1)) || /[?&](code|error_code)=/.test(location.search);

// The session Supabase saved in this browser at the last sign-in. It is only read, to draw
// the header and the signed-in pages straight away; Supabase checks it moments later.
function savedUser() {
  try {
    const ref = new URL(SUPABASE_URL).hostname.split(".")[0];
    const saved = JSON.parse(localStorage.getItem("sb-" + ref + "-auth-token"));
    const session = saved && (saved.currentSession || saved);
    return (session && session.user) || null;
  } catch (err) {
    return null;
  }
}

// The library starts downloading as soon as this module runs, not after the step list loads.
const library = CONFIGURED ? loadScript(SUPABASE_JS) : Promise.resolve();
library.catch(() => {}); // the failure is reported by init()

// Google sign-in leaves the site and comes back to the home page; this remembers, for that
// tab only, the page to go on to afterwards.
const GOOGLE_RETURN = "eirehome-google";
const GOOGLE_RETURN_MAX_AGE = 15 * 60 * 1000;
let googleCheck = null;

let markReady;
const whenReady = new Promise((resolve) => { markReady = resolve; });

export const Account = {
  enabled: false,
  ready: false,   // true once Supabase has said whether someone is signed in
  whenReady,      // resolves at that moment
  client: null,
  user: null,
  saved: CONFIGURED ? savedUser() : null,

  // Who to show as signed in: before Supabase answers, the session saved in this browser.
  shown() {
    return this.ready ? this.user : this.saved;
  },

  // Whether the header can already choose between "Sign in" and the account circle.
  settled() {
    return this.ready || !RETURNING;
  },

  // Whether accounts are on: before Supabase answers, whether config.js is filled in.
  available() {
    return this.ready ? this.enabled : CONFIGURED;
  },

  // onChange(user, event) runs on page load and on every sign-in, sign-out or password recovery.
  async init(onChange) {
    const done = (user, event) => {
      this.ready = true;
      markReady();
      return onChange(user, event);
    };
    if (!CONFIGURED) return done(null, "DISABLED");
    try {
      await library;
    } catch (err) {
      console.error("Could not load the Supabase library, so accounts are off for this visit.", err);
      return done(null, "DISABLED");
    }
    this.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    this.enabled = true;
    this.client.auth.onAuthStateChange((event, session) => {
      this.user = session ? session.user : null;
      this.ready = true;
      markReady();
      // Supabase advises against calling its other methods inside this callback, so defer.
      setTimeout(() => onChange(this.user, event), 0);
    });
  },

  // Confirmation and password emails always bring people back to the home page,
  // so the Supabase redirect list only needs the site's base address.
  homeUrl() {
    return new URL(".", location.href).href;
  },

  // The name is kept in the user's metadata (email templates can use {{ .Data.full_name }}).
  signUp(email, password, name) {
    return this.client.auth.signUp({
      email, password,
      options: { emailRedirectTo: this.homeUrl(), data: { full_name: name } },
    });
  },

  signIn(email, password) {
    return this.client.auth.signInWithPassword({ email, password });
  },

  // Whether Google sign-in is switched on in the Supabase dashboard. It is a public setting,
  // read with the publishable key; the Google client secret stays in the dashboard.
  googleAvailable() {
    if (!CONFIGURED) return Promise.resolve(false);
    if (!googleCheck) {
      googleCheck = fetch(SUPABASE_URL + "/auth/v1/settings", { headers: { apikey: SUPABASE_ANON_KEY } })
        .then((res) => (res.ok ? res.json() : null))
        .then((settings) => !!(settings && settings.external && settings.external.google))
        .catch(() => false);
    }
    return googleCheck;
  },

  // Sends the person to Google. Google and Supabase bring them back to the home page, which
  // keeps the site's folder (/EireHomeFlow/ on GitHub Pages), so the Supabase redirect list
  // only needs the site's base address; app.js then takes them on to `next`.
  signInWithGoogle(next) {
    try {
      sessionStorage.setItem(GOOGLE_RETURN, JSON.stringify({ next, at: Date.now() }));
    } catch (err) {
      // Storage blocked: the person stays on the home page after signing in.
    }
    return this.client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: this.homeUrl(), queryParams: { prompt: "select_account" } },
    });
  },

  // The page to go on to after Google, once: null when this visit is not a return from Google.
  takeGoogleReturn() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(GOOGLE_RETURN));
      sessionStorage.removeItem(GOOGLE_RETURN);
      return saved && Date.now() - saved.at < GOOGLE_RETURN_MAX_AGE ? saved : null;
    } catch (err) {
      return null;
    }
  },

  signOut() {
    return this.client.auth.signOut();
  },

  sendReset(email) {
    return this.client.auth.resetPasswordForEmail(email, { redirectTo: this.homeUrl() });
  },

  setPassword(password) {
    return this.client.auth.updateUser({ password });
  },

  // display_name survives a Google sign-in, which rewrites full_name with the Google name;
  // full_name is still set because the email templates read it.
  updateProfile(name) {
    return this.client.auth.updateUser({ data: { display_name: name, full_name: name } });
  },

  // Deletes the signed-in person's account for good, through the delete_my_account() database
  // function (SQL in specs/SETUP-CONTAS.md). The function can only delete the account of
  // whoever calls it, so no secret key is needed here. The saved progress goes with it
  // (ON DELETE CASCADE), and then this browser is signed out.
  async deleteAccount() {
    const { error } = await this.client.rpc("delete_my_account");
    if (error) {
      // PGRST202: the database function has not been created yet. My profile explains it to the reader.
      if (error.code === "PGRST202") throw Object.assign(new Error("delete_my_account() is not in the database yet."), { code: "delete_not_enabled" });
      throw error;
    }
    // The account is gone, so only this browser's copy of the session needs clearing.
    await this.client.auth.signOut({ scope: "local" });
  },

  async loadProgress() {
    const { data, error } = await this.client.from("progress").select("done").eq("user_id", this.user.id).maybeSingle();
    if (error) throw error;
    return data ? data.done : {};
  },

  async saveProgress(done) {
    const { error } = await this.client.from("progress")
      .upsert({ user_id: this.user.id, done, updated_at: new Date().toISOString() });
    if (error) throw error;
  },
};

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
