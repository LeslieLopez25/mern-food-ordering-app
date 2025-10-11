import { test, expect } from "@playwright/test";

const UI_URL = "http://localhost:5174";

test("place an order flow (mock Stripe)", async ({ page }) => {
  await page.goto(UI_URL);

  await page.fill('[data-testid="search-bar"]', "Guadalajara");
  await page.click('[data-testid="search-button"]');
  await page.click("text=Sage & Salt");

  await page.click("text=Menudo");
  await page.click("text=Birria Tacos");
  await page.click("text=Lasagna");

  await page.click("text=Go to checkout");

  await page.fill('input[name="name"]', "Test User");
  await page.fill('input[name="addressLine1"]', "Test Street 123");
  await page.fill('input[name="city"]', "Test City");
  await page.fill('input[name="country"]', "Test Country");

  await page.route("**/create-checkout-session", (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        url: `${UI_URL}/fake-stripe-success`,
        amount: 2700,
        currency: "mxn",
      }),
    });
  });

  await page.click("text=Continue to payment");

  await page.goto(`${UI_URL}/fake-stripe-success`);

  await page.goto(`${UI_URL}/order-status`);

  await expect(page.getByText("Order Status")).toBeVisible();
});
