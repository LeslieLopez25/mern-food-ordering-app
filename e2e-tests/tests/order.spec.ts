import { test, expect } from "@playwright/test";

const UI_URL = "http://localhost:5174";

const TEST_AUTH0_EMAIL = process.env.TEST_AUTH0_EMAIL ?? "test@example.com";

test("place an order flow", async ({ page }) => {
  await page.goto(UI_URL);

  await page.fill('[data-testid="search-bar"]', "Guadalajara");
  await page.click('[data-testid="search-button"]');

  await page.click("text=Sage & Salt");

  await page.click("text=Menudo");
  await page.click("text=Birria Tacos");
  await page.click("text=Lasagna");

  await page.click("text=Go to checkout");

  await page.fill('input[name="name"]', "Test User");
  await page.fill('input[name="addressLine1"]', "Test");
  await page.fill('input[name="city"]', "Test");
  await page.fill('input[name="country"]', "Test");
  await page.click("text=Continue to payment");

  await page.waitForURL("https://checkout.stripe.com/**");

  await page.fill('input[placeholder="email"]', TEST_AUTH0_EMAIL);
  await page
    .frameLocator('iframe[name^="__privateStripeFrame"]')
    .locator('[name="cardnumber"]')
    .fill("4242424242424242");
  await page
    .frameLocator('iframe[name^="__privateStripeFrame"]')
    .locator('input[name="exp-date"]')
    .fill("12/34");
  await page
    .frameLocator('iframe[name^="__privateStripeFrame"]')
    .locator('input[name="cvc"]')
    .fill("123");

  await page.fill('input[name="cardholder-name"]', "Test User");

  await page.click("text=Pay");

  await page.waitForURL("**/order-status");
  await expect(page.getByText("Order Status")).toBeVisible();
});
