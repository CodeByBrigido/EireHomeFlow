// Rules for account forms and the ?next= address. Pure, so Node tests can use them.

// Only relative page links are followed after signing in, e.g. "journey.html#step-aip-0".
export const safeNext = (value, fallback) => (/^[a-z-]+\.html(#[a-z0-9-]+)?$/.test(value || "") ? value : fallback);

// New passwords need 8+ characters, a capital letter and a symbol from the set Supabase Auth accepts.
export const PASSWORD_RULES = {
  length: (pw) => pw.length >= 8,
  upper: (pw) => /\p{Lu}/u.test(pw),
  special: (pw) => /[!@#$%^&*()_+\-=[\]{};'\\:"|<>?,./`~]/.test(pw),
};
export const strongPassword = (pw) => Object.values(PASSWORD_RULES).every((rule) => rule(pw));
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isFullName = (name) => name.trim().split(/\s+/).filter((word) => (word.match(/\p{L}/gu) || []).length >= 2).length >= 2;
