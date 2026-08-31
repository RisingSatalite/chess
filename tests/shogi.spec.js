import { test, expect } from '@playwright/test';

test('shogi page loads and shows a playable board', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/shogi');
  await expect(page.getByText('Simplified Shogi')).toBeVisible();
  await expect(page.getByText('Sente to move')).toBeVisible();
});
