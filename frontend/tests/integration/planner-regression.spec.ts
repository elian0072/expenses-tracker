import { expect, test } from "@playwright/test";

test("regression flow covers home CTAs and authenticated navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open 2026 Planner" })).toBeVisible();

  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@example.com");
  await page.getByLabel("Password").fill("change-me-please");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("heading", { name: /Planner 2026/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add expense" })).toBeVisible();
  await page.getByRole("link", { name: "Activity" }).click();
  await expect(page.getByRole("heading", { name: "Activity History" })).toBeVisible();
});
