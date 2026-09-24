// Form checks for sign-up, sign-in, passwords and the profile: red fields, messages,
// the live password rules and the status line under each form.
import { EMAIL_PATTERN, isFullName, PASSWORD_RULES, strongPassword } from "../lib/validation.js?v=20260925";

// Each check returns an error message, or "" when the field is fine. A form lists the
// fields to check in data-fields; data-password="current" means sign-in (no strength rules).
const FIELD_CHECKS = {
  name: (v) => (isFullName(v.name) ? "" : "Enter your first and last name."),
  email: (v) => (EMAIL_PATTERN.test(v.email.trim()) ? "" : "Enter a valid email address, like name@example.com."),
  password: (v, form) => (form.dataset.password === "current"
    ? (v.password ? "" : "Enter your password.")
    : (strongPassword(v.password) ? "" : "Your password does not meet the requirements below.")),
  confirm: (v) => (!v.confirm ? "Confirm your password." : v.confirm === v.password ? "" : "The passwords do not match."),
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
