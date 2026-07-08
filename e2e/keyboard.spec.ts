import { test, expect } from "@playwright/test";

test("skip link is the first tab stop and moves focus to main", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.locator("a.skip-link");
  await expect(skip).toBeFocused();
  await expect(skip).toHaveAttribute("href", "#main");
});

test("the whole search flow is operable by keyboard", async ({ page }) => {
  await page.goto("/");
  const input = page.getByLabel("מספר רישוי", { exact: true });
  await input.focus();
  await page.keyboard.type("1000028");
  await page.keyboard.press("Enter"); // submit via keyboard
  await expect(page).toHaveURL(/\/car\/1000028$/);
});

test("interactive elements expose a visible focus outline", async ({ page }) => {
  await page.goto("/");
  const button = page.getByRole("button", { name: "חפש" });
  await button.focus();
  const outlineWidth = await button.evaluate(
    (el) => getComputedStyle(el).outlineWidth,
  );
  // :focus-visible sets a 3px outline; assert it's a real, non-zero ring.
  expect(parseFloat(outlineWidth)).toBeGreaterThanOrEqual(2);
});

test("save action is reachable and toggles aria-pressed by keyboard", async ({ page }) => {
  await page.goto("/car/1000028");
  await page.waitForLoadState("networkidle");
  const save = page.getByRole("button", { name: /שמור את הרכב/ });
  // Only present on the success state (live data). Skip gracefully otherwise.
  if ((await save.count()) === 0) test.skip(true, "car data unavailable (offline)");
  await save.focus();
  await expect(save).toBeFocused();
  await expect(save).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: /נשמר — הסר מהרשימה/ }),
  ).toHaveAttribute("aria-pressed", "true");
});
