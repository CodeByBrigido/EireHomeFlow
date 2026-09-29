// Form checks for sign-up, sign-in, passwords, the profile and the contact form: red fields, messages,
// the live password rules and the status line under each form. Also the reader's version
// of the errors Supabase sends back.
import { EMAIL_PATTERN, isFullName, PASSWORD_RULES, strongPassword } from "../lib/validation.js?v=20261001";
import { locale, t } from "./i18n.js?v=20261001";

// Each check returns an error message, or "" when the field is fine. A form lists the
// fields to check in data-fields; data-password="current" means sign-in (no strength rules).
const FIELD_CHECKS = {
  name: (v) => (isFullName(v.name) ? "" : t("common:forms.name")),
  email: (v) => (EMAIL_PATTERN.test(v.email.trim()) ? "" : t("common:forms.email")),
  password: (v, form) => (form.dataset.password === "current"
    ? (v.password ? "" : t("common:forms.password"))
    : (strongPassword(v.password) ? "" : t("common:forms.weakPassword"))),
  confirm: (v) => (!v.confirm ? t("common:forms.confirm") : v.confirm === v.password ? "" : t("common:forms.mismatch")),
  message: (v) => (v.message.trim() ? "" : t("common:forms.message")),
};

const formFields = (form) => form.dataset.fields.split(" ");

export function formValues(form) {
  const values = {};
  for (const el of form.elements) if (el.name) values[el.name] = el.value;
  return values;
}

function markField(form, field, message) {
  const input = form.elements[field];
  input.closest(".field").classList.toggle("is-invalid", !!message);
  if (message) input.setAttribute("aria-invalid", "true");
  else input.removeAttribute("aria-invalid");
  form.querySelector("#error-" + field).textContent = message;
  const rules = form.querySelector(".password-rules");
  if (field === "password" && rules) rules.classList.toggle("is-invalid", !!message);
}

function checkField(form, field) {
  const message = FIELD_CHECKS[field](formValues(form), form);
  markField(form, field, message);
  return message;
}

// Checks every field; marks the wrong ones in red and moves focus to the first of them.
export function checkForm(form) {
  const invalid = formFields(form).filter((field) => checkField(form, field));
  if (invalid.length) form.elements[invalid[0]].focus();
  return invalid.length === 0;
}

export function renderPasswordRules(form) {
  const pw = form.elements.password ? form.elements.password.value : "";
  form.querySelectorAll(".password-rules li").forEach((li) => li.classList.toggle("is-met", PASSWORD_RULES[li.dataset.rule](pw)));
}

// Live feedback: a red field turns back to normal once fixed, and leaving a filled field checks it.
export function watchForm(form) {
  form.addEventListener("input", (e) => {
    const field = e.target.name;
    if (field === "password") renderPasswordRules(form);
    if (e.target.getAttribute("aria-invalid") === "true") checkField(form, field);
    if (field === "password" && form.elements.confirm && form.elements.confirm.getAttribute("aria-invalid") === "true") checkField(form, "confirm");
  });
  form.addEventListener("focusout", (e) => {
    if (formFields(form).includes(e.target.name) && e.target.value) checkField(form, e.target.name);
  });
}

export const sayInForm = (form, message) => { form.querySelector(".form-status").textContent = message; };

// An error whose message is already written for the reader, in the page's language.
export const readerError = (key) => Object.assign(new Error(t(key)), { forReader: true });

// Supabase answers in English, with a code for the common cases.
const AUTH_ERRORS = {
  invalid_credentials: "common:errors.invalidCredentials",
  email_not_confirmed: "common:errors.emailNotConfirmed",
  user_already_exists: "common:errors.userExists",
  email_exists: "common:errors.userExists",
  weak_password: "common:errors.weakPassword",
  same_password: "common:errors.samePassword",
  over_email_send_rate_limit: "common:errors.rateLimit",
  over_request_rate_limit: "common:errors.rateLimit",
  email_address_invalid: "common:forms.email",
  signup_disabled: "common:errors.signupsOff",
  session_not_found: "common:errors.sessionEnded",
  session_expired: "common:errors.sessionEnded",
  refresh_token_not_found: "common:errors.sessionEnded",
  otp_expired: "common:linkExpired",
};
// Replies without a code, recognised by their English message.
const AUTH_MESSAGES = [
  [/invalid login credentials/i, "common:errors.invalidCredentials"],
  [/email not confirmed/i, "common:errors.emailNotConfirmed"],
  [/already (registered|exists)/i, "common:errors.userExists"],
  [/rate limit|for security purposes/i, "common:errors.rateLimit"],
  [/failed to fetch|networkerror|load failed/i, "common:errors.network"],
];

// The message to show for an error from Supabase or from this site's scripts.
export function errorText(err) {
  if (err && err.forReader) return err.message;
  const message = (err && err.message) || "";
  const known = (err && AUTH_ERRORS[err.code]) || (AUTH_MESSAGES.find(([pattern]) => pattern.test(message)) || [])[1];
  if (known) return t(known);
  // Anything else: Supabase's own words in English, a general message in other languages.
  return locale() === "en" && message ? message : t("common:errors.generic");
}
