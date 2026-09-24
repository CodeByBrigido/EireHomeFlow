// ESLint: catches undeclared names (a forgotten import), unused code and common mistakes.
// Run with: npm run lint
import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules/**",
      "_original-Backup/**",
      // Classic scripts, replaced by ES modules in the next task. Delete these lines then.
      "docs/js/app.js",
      "docs/js/account.js",
      "docs/js/config.js",
      "docs/js/pages/**",
    ],
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
    files: ["tests/**/*.js", "tools/**/*.js", "eslint.config.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module", globals: globals.node },
  },
];
