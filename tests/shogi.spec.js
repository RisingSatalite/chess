import { test, expect } from '@playwright/test';

test('shogi page loads and shows a playable board', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/shogi');
  await expect(page.getByText('Simplified Shogi')).toBeVisible();
  await expect(page.getByText('Sente to move')).toBeVisible();
});

test('captured shogi pieces can be dragged back onto the board', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/shogi');

  await expect(page.getByText('Captured pieces')).toBeVisible();

  const trayPiece = page.locator('[data-testid="captured-piece-W-P"]');
  const targetSquare = page.locator('[data-testid="board-square-0"]');

  await expect(trayPiece).toHaveCount(1);
  await trayPiece.dragTo(targetSquare);

  await expect(targetSquare).toContainText('P');
});
