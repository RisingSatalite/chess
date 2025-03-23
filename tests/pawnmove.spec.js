import { test, expect } from '@playwright/test';

test('pawndoublemove', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.locator('div:nth-child(7) > button:nth-child(8)').click();
  await page.locator('div:nth-child(5) > button:nth-child(8)').click();
});

test('simplepawn', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.locator('div:nth-child(5) > button:nth-child(8)').click();
  await page.locator('div:nth-child(6) > button:nth-child(7)').click();
  await page.locator('div:nth-child(7) > button:nth-child(7)').click();
  await page.locator('div:nth-child(6) > button:nth-child(7)').click();
  await page.locator('div:nth-child(7) > button:nth-child(7)').click();
  await page.locator('div:nth-child(6) > button:nth-child(7)').click();
  await page.locator('div:nth-child(7) > button:nth-child(4)').click();
  await page.locator('div:nth-child(6) > button:nth-child(4)').click();
  await page.locator('div:nth-child(2) > button:nth-child(5)').click();
  await page.locator('div:nth-child(3) > button:nth-child(5)').click();
});

test('pawndiagonaltake', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.locator('div:nth-child(7) > button:nth-child(4)').click();
  await page.locator('div:nth-child(5) > button:nth-child(4)').click();
  await page.locator('div:nth-child(2) > button:nth-child(5)').click();
  await page.locator('div:nth-child(4) > button:nth-child(5)').click();
  await page.locator('div:nth-child(5) > button:nth-child(4)').click();
  await page.locator('div:nth-child(4) > button:nth-child(5)').click();
});