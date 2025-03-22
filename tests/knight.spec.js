import { test, expect } from '@playwright/test';

test('knighfirstmove', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: '-WN' }).nth(1).click();
  await page.locator('div:nth-child(6) > button:nth-child(6)').click();
});