// Accounts: Supabase sign-up and sign-in, plus a cloud copy of journey progress.
// Settings come from config.js. With them empty, Account.enabled stays false
// and the Supabase library is never downloaded.

const SUPABASE_JS = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";

const Account = {
  enabled: false,
  ready: false,   // true once we know whether someone is signed in
  client: null,
  user: null,

  // onChange(user, event) runs on page load and on every sign-in, sign-out or password recovery.
  async init(onChange) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      this.ready = true;
      return onChange(null, "DISABLED");
    }
    try {
      await loadScript(SUPABASE_JS);
    } catch (err) {
      console.error("Could not load the Supabase library, so accounts are off for this visit.", err);
      this.ready = true;
      return onChange(null, "DISABLED");
    }
    this.client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    this.enabled = true;
    this.client.auth.onAuthStateChange((event, session) => {
      this.user = session ? session.user : null;
      this.ready = true;
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

  signOut() {
    return this.client.auth.signOut();
  },

  sendReset(email) {
    return this.client.auth.resetPasswordForEmail(email, { redirectTo: this.homeUrl() });
  },

  setPassword(password) {
    return this.client.auth.updateUser({ password });
  },

  updateProfile(name) {
    return this.client.auth.updateUser({ data: { full_name: name } });
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
