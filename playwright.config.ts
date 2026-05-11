import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.CLAWPDF_BASE_URL || "https://clawpdf.netlify.app";

export default defineConfig({
  testDir: "./e2e/tests",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    headless: true,
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
