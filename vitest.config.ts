import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts"],
      exclude: [
        "src/lib/db/**",
        "src/lib/supabase/**",
        "src/lib/email.ts",
        "src/lib/stripe.ts",
        "src/lib/google.ts",
        "src/lib/auth.ts",
        "src/lib/audit.ts",
        "src/lib/qr-pdf.ts",
        "src/lib/version.ts",
        "src/lib/plausible.ts",
      ],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
