// Flat ESLint config (ESLint 10 / Next 16). `next lint` was removed in Next 16,
// so `npm run lint` invokes ESLint directly (see package.json).
import next from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: [
      "legacy/**",
      "venture-plan/**",
      ".next/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  ...next,
];

export default eslintConfig;
