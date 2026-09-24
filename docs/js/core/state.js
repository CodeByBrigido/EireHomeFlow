// The journey and calculator state, saved in this browser. Pages change it with setState();
// core/app.js subscribes with onStateChange() to re-render after every change.
import { RANGES } from "../lib/calculator.js?v=20260924";
import { num } from "../lib/format.js?v=20260924";

const STORAGE_KEY = "eirehome-flow";
const SAVED_FIELDS = ["ftb", "joint", "newBuild", "apartment", "salary", "salary2", "savings", "gift", "htb", "price", "rate", "term", "calcSaved"];

// calcSaved: true once the person has saved the calculator to their journey.
// Until then, the figures are the examples below, not theirs.
export const state = {
  done: {}, open: null,
  ftb: true, joint: false, newBuild: false, apartment: false,
  salary: "45000", salary2: "38000", savings: "35000", gift: "0", htb: "0", price: "380000",
  rate: "3.9", term: "30", calcSaved: "",
};

const listeners = [];
export const onStateChange = (fn) => { listeners.push(fn); };

export function setState(patch) {
  Object.assign(state, patch);
  save();
  listeners.forEach((fn) => fn());
}

// Progress and calculator figures are kept in this browser. Signed-in users also get a cloud copy.
export function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return;
    if (saved.done) state.done = saved.done;
    for (const key of SAVED_FIELDS) if (key in saved) state[key] = saved[key];
  } catch (err) {
    // Storage blocked or unreadable: start fresh.
  }
  // Figures saved before the sliders existed can be outside their range.
  for (const key in RANGES) {
    const [min, max, fallback] = RANGES[key];
    const value = num(state[key]);
    if (value < min || value > max) state[key] = String(value ? Math.min(max, Math.max(min, value)) : fallback);
  }
}

function save() {
  try {
    const out = { done: state.done };
    for (const key of SAVED_FIELDS) out[key] = state[key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
  } catch (err) {
    // Storage blocked (private mode): progress lasts for this visit only.
  }
}
