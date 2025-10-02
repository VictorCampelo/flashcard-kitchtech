import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test('form inputs have proper labels', async ({ page }) => {
    await page.goto('/');
    
    await page.getByTestId('new-flashcard-button').click();

    // Check for label associations
    const frontLabel = page.locator('label[for="front"]');
    const backLabel = page.locator('label[for="back"]');

    await expect(frontLabel).toBeVisible();
    await expect(backLabel).toBeVisible();
    await expect(frontLabel).toContainText('Question');
    await expect(backLabel).toContainText('Answer');
  });

  test('buttons have aria-labels', async ({ page }) => {
    await page.goto('/');
    
    // Create a flashcard first
    await page.getByTestId('new-flashcard-button').click();
    await page.getByTestId('front-input').fill('Test');
    await page.getByTestId('back-input').fill('Test');
    await page.getByTestId('submit-button').click();

    // Check aria-labels
    const editButton = page.getByTestId('edit-button').first();
    const deleteButton = page.getByTestId('delete-button').first();

    await expect(editButton).toHaveAttribute('aria-label', 'Edit flashcard');
    await expect(deleteButton).toHaveAttribute('aria-label', 'Delete flashcard');
  });

  test('error messages have role alert', async ({ page }) => {
    await page.goto('/');
    
    await page.getByTestId('new-flashcard-button').click();
    await page.getByTestId('submit-button').click();

    const errorMessage = page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible();
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Tab to new flashcard button and press Enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Form should be visible
    await expect(page.getByTestId('flashcard-form')).toBeVisible();

    // Tab through form fields
    await page.keyboard.press('Tab'); // Skip to front input
    await page.keyboard.type('Keyboard test');
    
    await page.keyboard.press('Tab'); // Move to back input
    await page.keyboard.type('Keyboard answer');
  });

  test('focus indicators are visible', async ({ page }) => {
    await page.goto('/');
    
    await page.getByTestId('new-flashcard-button').click();
    
    const frontInput = page.getByTestId('front-input');
    await frontInput.focus();

    // Check if element is focused
    await expect(frontInput).toBeFocused();
  });
});
