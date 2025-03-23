import { test, expect } from '@playwright/test';

test('bishopghosting', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: '-WB' }).first().click();
  await page.locator('div:nth-child(5) > button:nth-child(6)').click();
  await expect(page.locator('div:nth-child(5) > button:nth-child(6)')).toBeVisible();
  await page.getByRole('button', { name: '-WB' }).first().click();
});