import { defineConfig, devices } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "./.env.e2e") });

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      // Runs first to perform login
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: { storageState: undefined },
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: path.join(__dirname, "storageState.json"), // saved session
      },
      dependencies: ["setup"],
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        storageState: path.join(__dirname, "storageState.json"), // saved session
      },
      dependencies: ["setup"],
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        storageState: path.join(__dirname, "storageState.json"), // saved session
      },
      dependencies: ["setup"],
    },
  ],
  webServer: [
    {
      command: "npm run dev --prefix ../client",
      port: 5173,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run dev --prefix ../server",
      port: 7000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
