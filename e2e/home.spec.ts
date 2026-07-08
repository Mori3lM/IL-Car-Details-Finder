import { test, expect } from "@playwright/test";

test("home renders the value proposition and search", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/הרכב/);
  await expect(page.getByRole("search")).toBeVisible();
  await expect(page.getByRole("button", { name: "חפש" })).toBeVisible();
});

test("invalid plate shows an inline alert and does not navigate", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("מספר רישוי", { exact: true }).fill("12");
  await page.getByRole("button", { name: "חפש" }).click();
  // Scope to the search form (Next also renders an empty route-announcer alert).
  await expect(page.getByRole("search").getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL("/");
});

test("a valid plate navigates to the SSR car page", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("מספר רישוי", { exact: true }).fill("12-345-67");
  await page.getByRole("button", { name: "חפש" }).click();
  await expect(page).toHaveURL(/\/car\/1234567$/);
});
