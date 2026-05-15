import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  workers: 4,
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || "https://dev.d3khg7987ikp0y.amplifyapp.com" },
  reporter: "list",
});
