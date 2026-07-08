import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

test("accessibility menu: keyboard-operable, applies, and no axe violations when open", async ({
  page,
}) => {
  await page.goto("/");

  // Open via keyboard.
  const fab = page.getByRole("button", { name: "תפריט נגישות", exact: true });
  await fab.focus();
  await expect(fab).toBeFocused();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", { name: "תפריט נגישות" });
  await expect(dialog).toBeVisible();

  // The open menu itself must be accessible.
  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .analyze();
  expect(violations).toEqual([]);

  // Apply dark theme + a font-size increase.
  await page.getByRole("button", { name: "כהה" }).click();
  await page.getByRole("button", { name: "הגדלת גודל הטקסט" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveJSProperty("style.fontSize", "110%");
});

test("accessibility menu: Esc closes, returns focus, and choices persist", async ({
  page,
}) => {
  await page.goto("/");
  const fab = page.getByRole("button", { name: "תפריט נגישות", exact: true });
  await fab.click();
  const dialog = page.getByRole("dialog", { name: "תפריט נגישות" });
  await expect(dialog).toBeVisible();

  await page.getByRole("button", { name: "הדגשת קישורים" }).click();

  // Esc closes the native dialog and returns focus to the trigger.
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(fab).toBeFocused();

  // Choice persists across reload.
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/a11y-highlight-links/);
});

test("footer link opens the accessibility menu (reliable in-flow entry point)", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "פתיחת תפריט נגישות" }).click();
  await expect(page.getByRole("dialog", { name: "תפריט נגישות" })).toBeVisible();
});
