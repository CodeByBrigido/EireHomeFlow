// Toast notices, and "flash" notices carried to the next page in sessionStorage.

const FLASH_KEY = "eirehome-flash";

let toastTimer = null;

export function showToast(message, { error = false, action = null, sticky = false } = {}) {
  const box = document.getElementById("toast");
  if (!box) return;
  clearTimeout(toastTimer);
  box.classList.toggle("is-error", error);
  box.querySelector(".toast__icon").textContent = error ? "!" : "✓";
  const link = document.getElementById("toast-action");
  link.hidden = !action;
  if (action) {
    link.textContent = action.label;
    link.href = action.href;
  }
  const text = document.getElementById("toast-text");
  text.textContent = "";
  box.hidden = false;
  // Filling the text a moment after showing the box lets screen readers announce it.
  setTimeout(() => { text.textContent = message; }, 50);
  if (!sticky) toastTimer = setTimeout(hideToast, 7000);
}

export function hideToast() {
  clearTimeout(toastTimer);
  const box = document.getElementById("toast");
  if (box) box.hidden = true;
}

// A notice to show on the next page, e.g. "Welcome back" after signing in.
export function flash(message, options) {
  try {
    sessionStorage.setItem(FLASH_KEY, JSON.stringify({ message, options }));
  } catch (err) {
    // Storage blocked: the next page simply shows no notice.
  }
}

export function showFlash() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(FLASH_KEY));
    sessionStorage.removeItem(FLASH_KEY);
    if (saved) showToast(saved.message, saved.options);
  } catch (err) {
    // Nothing to show.
  }
}
