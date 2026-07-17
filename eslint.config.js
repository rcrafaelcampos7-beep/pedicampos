import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

const sourceFiles = ["src/**/*.{js,jsx}"];
const testFiles = ["src/**/*.test.{js,jsx}", "src/test/**/*.js", "supabase/functions/**/*.test.js"];

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "supabase/.temp/**",
      "supabase/functions/**/*.ts",
      "**/*.min.js",
      "public/**",
      "src/assets/**",
    ],
  },
  js.configs.recommended,
  {
    files: sourceFiles,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      }],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
  {
    files: testFiles,
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.vitest },
    },
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["src/services/database.js"],
    rules: {
      // This service has no React hooks. Its legacy connection helper starts
      // with "use" and would otherwise be misclassified as a custom hook.
      "react-hooks/rules-of-hooks": "off",
    },
  },
  {
    files: ["src/routes/router.jsx", "src/routes/lazyNamed.js"],
    rules: {
      // These modules intentionally export routing helpers alongside Link.
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["vite.config.js", "eslint.config.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
];
