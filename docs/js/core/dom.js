// The current page and the data-bind helper used by every page.

// <body data-page="..."> names the page: home, guide, journey, calculator, dashboard, ...
export const PAGE = document.body.dataset.page;

export function bind(name, value) {
  document.querySelectorAll('[data-bind="' + name + '"]').forEach((el) => { el.textContent = value; });
}
