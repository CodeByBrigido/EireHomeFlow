// ESLint: catches undeclared names (a forgotten import), unused code and common mistakes.
// Run with: npm run lint
import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", "_original-Backup/**"],
  },
  js.configs.recommended,
  {
    rules: {
      // `catch (err) { /* nothing to do */ }` is a deliberate pattern in this code base.
      "no-unused-vars": ["error", { caughtErrors: "none" }],
    },
  },
  {
    files: ["docs/**/*.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module", globals: globals.browser },
  },
  {
    // The translations runtime is a classic script in <head>, not a module.
    files: ["docs/js/i18n-boot.js"],
    languageOptions: { sourceType: "script" },
  },
  {
    // Supabase Edge Functions run on Deno, which has the browser's fetch, Request and crypto.
    files: ["supabase/functions/**/*.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module", globals: { ...globals.browser, Deno: "readonly" } },
  },
  {
    files: ["tests/**/*.js", "tools/**/*.js", "eslint.config.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module", globals: globals.node },
  },
];
