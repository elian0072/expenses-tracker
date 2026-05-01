import { expect, test } from "@playwright/test";

test("mobile menu exposes activity navigation after sign in", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await page.getByLabel("Email").fill("owner@example.com");
  await page.getByLabel("Password").fill("change-me-please");
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.getByLabel("Open navigation menu").click();
  await expect(page.getByText("Activity")).toBeVisible();
  await expect(page.getByText("Sign out")).toBeVisible();
});
