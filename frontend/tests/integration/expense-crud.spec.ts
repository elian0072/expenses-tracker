import { expect, test } from "@playwright/test";

test("user can sign in and reach planner CRUD entry points", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@example.com");
  await page.getByLabel("Password").fill("change-me-please");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: /Planner 2026/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add expense" })).toBeVisible();
});
