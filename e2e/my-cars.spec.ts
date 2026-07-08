import { test, expect } from "@playwright/test";

// Far-future expiry keeps the status chip deterministically "בתוקף".
const SAMPLE = [
  {
    plate: "1000028",
    name: "פורשה גרמניה MACAN S DIESEL",
    licenceExpiry: "2030-03-15",
    licenceLevel: "ok",
    savedAt: "2026-07-08T09:00:00.000Z",
  },
];

async function seed(page: import("@playwright/test").Page) {
  await page.evaluate(
    (data) => localStorage.setItem("ilcf:savedVehicles", JSON.stringify(data)),
    SAMPLE,
  );
}

test("saved cars persist across reloads and can be removed", async ({ page }) => {
  await page.goto("/my-cars");
  await expect(page.getByText(/עדיין לא שמרתם רכב/)).toBeVisible();

  await seed(page);
  await page.reload();
  await expect(page.getByText("פורשה גרמניה MACAN S DIESEL", { exact: true })).toBeVisible();
  await expect(page.getByText("רישוי בתוקף", { exact: true })).toBeVisible();

  // Persist across a second reload (same browser).
  await page.reload();
  await expect(page.getByText("פורשה גרמניה MACAN S DIESEL", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "הסר" }).click();
  await expect(page.getByText("פורשה גרמניה MACAN S DIESEL", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/עדיין לא שמרתם רכב/)).toBeVisible();
});

test("reminder lead-time preference persists across reloads", async ({ page }) => {
  await page.goto("/my-cars");
  await seed(page);
  await page.reload();

  await page.getByLabel(/תזכורת מראש/).selectOption("60");
  await page.reload();
  await expect(page.getByLabel(/תזכורת מראש/)).toHaveValue("60");
});
