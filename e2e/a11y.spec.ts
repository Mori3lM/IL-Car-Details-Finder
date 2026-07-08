import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function axe(page: Page) {
  return new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
}

const SAMPLE = [
  {
    plate: "1000028",
    name: "פורשה גרמניה MACAN S DIESEL",
    licenceExpiry: "2030-03-15",
    licenceLevel: "ok",
    savedAt: "2026-07-08T09:00:00.000Z",
  },
];

test("home — no axe violations", async ({ page }) => {
  await page.goto("/");
  const { violations } = await axe(page);
  expect(violations).toEqual([]);
});

test("car result page — no axe violations", async ({ page }) => {
  // Any state (success via live data, or a handled error) must be accessible.
  await page.goto("/car/1000028");
  await page.waitForLoadState("networkidle");
  const { violations } = await axe(page);
  expect(violations).toEqual([]);
});

test("my-cars (empty) — no axe violations", async ({ page }) => {
  await page.goto("/my-cars");
  const { violations } = await axe(page);
  expect(violations).toEqual([]);
});

test("my-cars (with saved cars) — no axe violations", async ({ page }) => {
  await page.goto("/my-cars");
  await page.evaluate(
    (data) => localStorage.setItem("ilcf:savedVehicles", JSON.stringify(data)),
    SAMPLE,
  );
  await page.reload();
  await expect(page.getByText("פורשה גרמניה MACAN S DIESEL", { exact: true })).toBeVisible();
  const { violations } = await axe(page);
  expect(violations).toEqual([]);
});

test("about-data, privacy & accessibility statement — no axe violations", async ({
  page,
}) => {
  for (const path of ["/about-data", "/privacy", "/accessibility"]) {
    await page.goto(path);
    const { violations } = await axe(page);
    expect(violations, `axe on ${path}`).toEqual([]);
  }
});

test("dark mode — no axe violations (contrast holds in both themes)", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  expect((await axe(page)).violations, "home dark").toEqual([]);

  await page.goto("/car/1000028");
  await page.waitForLoadState("networkidle");
  expect((await axe(page)).violations, "car dark").toEqual([]);

  await page.goto("/my-cars");
  await page.evaluate(
    (data) => localStorage.setItem("ilcf:savedVehicles", JSON.stringify(data)),
    SAMPLE,
  );
  await page.reload();
  expect((await axe(page)).violations, "my-cars dark").toEqual([]);
});
