import { expect, test } from '@playwright/test';

test('Janggi soldiers can move sideways before crossing the river', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/janggi');

  await page.getByRole('button', { name: 'Square 55, WS' }).click();
  await page.getByRole('button', { name: 'Square 56, empty' }).click();

  await expect(page.getByRole('button', { name: 'Square 55, empty' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Square 56, WS' })).toBeVisible();
});

test('Janggi generals and advisors can move along palace lines', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/janggi');

  await page.getByRole('button', { name: 'Square 86, WG' }).click();
  await page.getByRole('button', { name: 'Square 76, empty' }).click();

  await expect(page.getByRole('button', { name: 'Square 86, empty' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Square 76, WG' })).toBeVisible();

  await page.getByRole('button', { name: 'Square 4, BA' }).click();
  await page.getByRole('button', { name: 'Square 13, empty' }).click();

  await expect(page.getByRole('button', { name: 'Square 4, empty' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Square 13, BA' })).toBeVisible();
});
