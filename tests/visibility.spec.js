import { test, expect } from '@playwright/test';

test('leftbottomrook', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: '-WR' }).first().click();
  await expect(page.getByRole('button', { name: '-WR' }).first()).toBeVisible();
});

test('royalpieces', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.getByRole('button', { name: '-WK' })).toBeVisible();
  await page.getByRole('button', { name: '-BK' }).click();
  await page.getByRole('button', { name: '-BK' }).click();
  await page.getByRole('button', { name: '-WQ' }).click();
  await page.getByRole('button', { name: '-BQ' }).click();
});

test('basicboarddisplay', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: '-BN' }).first().click();
  await page.getByRole('button', { name: '-BB' }).first().click();
  await page.getByRole('button', { name: '-BK' }).click();
  await page.getByRole('button', { name: '-BQ' }).click();
  await page.getByRole('button', { name: '-BB' }).nth(1).click();
  await page.getByRole('button', { name: '-BN' }).nth(1).click();
  await page.getByRole('button', { name: '-BR' }).nth(1).click();
  await page.locator('div:nth-child(2) > button:nth-child(8)').click();
  await page.locator('div:nth-child(3) > button:nth-child(8)').click();
  await page.locator('div:nth-child(4) > button:nth-child(8)').click();
  await page.locator('div:nth-child(5) > button:nth-child(8)').click();
  await page.locator('div:nth-child(6) > button:nth-child(8)').click();
  await page.locator('div:nth-child(7) > button:nth-child(8)').click();
  await page.getByRole('button', { name: '-WR' }).nth(1).click();
});