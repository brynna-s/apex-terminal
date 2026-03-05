import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.ts"],
    reporters: ["default", "./src/lib/__tests__/html-reporter.ts"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts"],
      exclude: [
        "src/lib/__tests__/**",
        "src/lib/types.ts",
        "src/lib/d3-force-3d.d.ts",
        "src/lib/graph-data.ts",
        "src/lib/athena-graph-data.ts",
        "src/lib/tarski-data.ts",
        "src/lib/llm-providers.ts",
        "src/lib/graph-layout.ts",
        "src/lib/useReplayTick.ts",
        "src/lib/copilot-context.ts",
      ],
    },
  },
});
