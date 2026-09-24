// Small helpers for numbers and text. Pure: no DOM, so Node tests can use them.

export const num = (v) => Number(v) || 0;
export const euro = (n) => "€" + Math.round(n).toLocaleString("en-IE");
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
