import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.e2e") });

const authFile = path.resolve(__dirname, "../storageState.json");
const UI_URL = "http://localhost:5173";

test("authenticate", async ({ page }) => {
  await page.goto(UI_URL);

  await page.click("text=Log In");

  await page.waitForSelector('input[name="username"]');
  await page.fill('input[name="username"]', process.env.TEST_AUTH0_EMAIL!);
  await page.fill('input[name="password"]', process.env.TEST_AUTH0_PASSWORD!);

  await page.click('button[type="submit"]');

  await page.waitForURL(`${UI_URL}/**`);

  await expect(page.getByText("Order Status")).toBeVisible();
  await expect(page.getByText(process.env.TEST_AUTH0_EMAIL!)).toBeVisible();

  await page.context().storageState({ path: authFile });
});
