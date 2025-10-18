import { defineConfig, devices } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "./.env.e2e") });

process.env.NODE_ENV = "test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5174",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: { storageState: undefined },
    },
    {
      name: "chromium",
      testMatch: /.*\.spec\.ts$/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: path.join(__dirname, "storageState.json"),
      },
      dependencies: ["setup"],
    },
    {
      name: "firefox",
      testMatch: /.*\.spec\.ts$/,
      use: {
        ...devices["Desktop Firefox"],
        storageState: path.join(__dirname, "storageState.json"),
      },
      dependencies: ["setup"],
    },
    {
      name: "webkit",
      testMatch: /.*\.spec\.ts$/,
      use: {
        ...devices["Desktop Safari"],
        storageState: path.join(__dirname, "storageState.json"),
      },
      dependencies: ["setup"],
    },
  ],
  webServer: [
    {
      command: "npm run dev --prefix ../client",
      port: 5174,
      reuseExistingServer: !process.env.CI,
      env: {
        NODE_ENV: "test",
      },
    },
    {
      command: "npm run dev --prefix ../server",
      port: 7000,
      reuseExistingServer: !process.env.CI,
      env: {
        NODE_ENV: "test",
      },
      timeout: 60_000,
    },
  ],
});
