import { expect, test } from "@playwright/test";

test("year planner shows totals and status filters", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@example.com");
  await page.getByLabel("Password").fill("change-me-please");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByText("Planned Total")).toBeVisible();
  await expect(page.getByText("Purchased Total")).toBeVisible();
  await expect(page.getByRole("button", { name: "All" })).toBeVisible();
});
