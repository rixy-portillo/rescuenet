import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/actions/**/*.integration.test.ts"],
    setupFiles: ["./vitest.integration.setup.ts"],
  },
});
