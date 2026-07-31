import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: [".codex-compact/**", ".codex-compact2/**"] },
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "src/features/nursing-icu/nursing-icu-pages.tsx",
      "src/features/nursing-icu/components/nursing-icu-workflow.tsx",
      "src/features/nursing-icu/components/unit-assigned-patients.tsx",
      "src/features/nursing-icu/components/unit-ward-escalations.tsx",
      "src/features/rapid-review/rapid-review-pages.tsx",
      "src/features/rapid-review/rapid-review-graph.tsx",
      "src/features/renal/renal-pages.tsx",
      "src/features/notes/notes-page.tsx",
      "src/features/diagnostic-hub/diagnostic-hub-page.tsx",
      "src/features/discharge/discharge-pages.tsx",
      "src/features/discharge/discharge-medication-reconciliation.tsx",
      "src/features/patient-journey/patient-journey-pages.tsx",
    ],
    rules: { "@typescript-eslint/ban-ts-comment": "off" },
  },
  {
    files: ["src/features/nursing-icu/nursing-icu-page-types.ts"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
];

export default eslintConfig;
