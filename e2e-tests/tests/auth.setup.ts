import { test as setup } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "auth.json");

const UI_URL = "http://localhost:5173";

setup("authenticate", async ({ page }) => {
  await page.goto(UI_URL);

  await page.click("text=Login");

  await page.waitForURL("**/u/login");

  await page.fill('input[name="username"]', process.env.TEST_AUTH0_EMAIL!);
  await page.fill('input[name="password"]', process.env.TEST_AUTH0_PASSWORD!);

  await page.click('button[type="submit"]');

  await page.waitForURL(`{UI_URL/}**`);

  await page.context().storageState({ path: authFile });
});
