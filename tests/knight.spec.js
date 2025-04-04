import { test, expect } from '@playwright/test';

test('knighfirstmove', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: '-WN' }).nth(1).click();
  await page.locator('div:nth-child(6) > button:nth-child(6)').click();
});

test('knightmove', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('button', { name: '-WN' }).nth(1).click();
    await page.locator('div:nth-child(6) > button:nth-child(6)').click();
    await page.getByRole('button', { name: '-BN' }).nth(1).click();
    await page.locator('div:nth-child(3) > button:nth-child(6)').click();
    await page.getByRole('button', { name: '-WN' }).nth(1).click();
    await page.locator('div:nth-child(6) > button:nth-child(3)').click();
    await page.getByRole('button', { name: '-BN' }).first().click();
    await page.locator('div:nth-child(3) > button:nth-child(3)').click();
    await page.getByRole('button', { name: '-WN' }).first().click();
    await page.locator('div:nth-child(4) > button:nth-child(4)').click();
    await page.getByRole('button', { name: '-BN' }).nth(1).click();
    await page.locator('div:nth-child(5) > button:nth-child(5)').click();
    await page.getByRole('button', { name: '-WN' }).first().click();
    await page.locator('div:nth-child(5) > button:nth-child(2)').click();
    await page.getByRole('button', { name: '-BN' }).nth(1).click();
    await page.locator('div:nth-child(4) > button:nth-child(7)').click();
    await page.getByRole('button', { name: '-WN' }).nth(1).click();
    await page.locator('div:nth-child(5) > button:nth-child(8)').click();
    await page.getByRole('button', { name: '-BN' }).first().click();
    await page.locator('div:nth-child(4) > button').first().click();
  });