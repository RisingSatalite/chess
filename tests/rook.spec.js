import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.locator('div:nth-child(7) > button:nth-child(8)').click();
  await page.locator('div:nth-child(5) > button:nth-child(8)').click();
  await page.locator('div:nth-child(2) > button:nth-child(8)').click();
  await page.locator('div:nth-child(4) > button:nth-child(8)').click();
  await page.getByRole('button', { name: '-WR' }).nth(1).click();
  await page.locator('div:nth-child(6) > button:nth-child(8)').click();
  await page.getByRole('button', { name: '-BR' }).nth(1).click();
  await page.locator('div:nth-child(3) > button:nth-child(8)').click();
  await page.getByRole('button', { name: '-WR' }).first().click();
  await page.locator('div:nth-child(6) > button:nth-child(2)').click();
  await page.getByRole('button', { name: '-BR' }).nth(1).click();
  await page.locator('div:nth-child(3) > button:nth-child(6)').click();
  await page.getByRole('button', { name: '-WR' }).first().click();
  await page.locator('div:nth-child(4) > button:nth-child(2)').click();
  await page.getByRole('button', { name: '-BR' }).nth(1).click();
  await page.locator('div:nth-child(5) > button:nth-child(6)').click();
  await expect(page.getByRole('button', { name: '-WR' }).first()).toBeVisible();
  await page.getByRole('button', { name: '-BR' }).nth(1).click();
});