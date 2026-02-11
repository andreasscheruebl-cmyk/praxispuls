import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import sonarjs from "eslint-plugin-sonarjs";
import security from "eslint-plugin-security";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  sonarjs.configs.recommended,
  security.configs.recommended,
  {
    rules: {
      // Complexity rules
      "complexity": ["warn", 10],
      "max-depth": ["warn", 4],
      "max-lines-per-function": ["warn", { max: 50, skipBlankLines: true, skipComments: true }],
      "max-params": ["warn", 4],
      "max-nested-callbacks": ["warn", 3],

      // SonarJS overrides – downgrade to warn for existing code
      "sonarjs/cognitive-complexity": ["warn", 15],
      "sonarjs/no-nested-conditional": "warn",
      "sonarjs/no-nested-functions": "warn",
      "sonarjs/no-commented-code": "warn",
      "sonarjs/todo-tag": "warn",
      "sonarjs/fixme-tag": "warn",
      "sonarjs/deprecation": "warn",
      "sonarjs/anchor-precedence": "warn",
      "sonarjs/no-hook-setter-in-body": "warn",
      "sonarjs/jsx-no-leaked-render": "warn",
      "sonarjs/no-unused-vars": "off",
      "sonarjs/unused-import": "off",
      "sonarjs/no-dead-store": "warn",
      "sonarjs/no-redundant-optional": "warn",
      "sonarjs/no-nested-template-literals": "warn",
      "sonarjs/prefer-default-last": "warn",
      "sonarjs/pseudo-random": "warn",
      "sonarjs/different-types-comparison": "warn",
      "sonarjs/no-hardcoded-secrets": "warn",
      "sonarjs/hardcoded-secret-signatures": "warn",
      "sonarjs/redundant-type-aliases": "off",
      "sonarjs/no-selector-parameter": "warn",
    },
  },
];

export default eslintConfig;
