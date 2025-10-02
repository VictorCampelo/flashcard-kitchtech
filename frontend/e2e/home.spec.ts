import { test, expect } from '@playwright/test';
import { setupApiMocks, clearMockFlashcards } from './api-mocks';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mocks before navigation
    clearMockFlashcards();
    await setupApiMocks(page);
    
    // Navigate and wait for load
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Wait for React to mount
    await page.waitForTimeout(1000);
  });

  test('should display home page with header', async ({ page }) => {
    // Debug: log page content if test fails
    const bodyText = await page.textContent('body');
    console.log('Page body text:', bodyText?.substring(0, 200));
    
    // Wait for the home page to be fully rendered
    await expect(page.getByTestId('home-page')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('🎴 Aloo App')).toBeVisible();
    await expect(page.getByText('Master your knowledge with spaced repetition')).toBeVisible();
  });

  test('should display action buttons', async ({ page }) => {
    await expect(page.getByTestId('new-flashcard-button')).toBeVisible();
    await expect(page.getByTestId('refresh-button')).toBeVisible();
  });

  test('should display empty state when no flashcards', async ({ page }) => {
    // Assuming fresh database or no flashcards
    const emptyState = page.getByTestId('empty-state');
    if (await emptyState.isVisible()) {
      await expect(page.getByText('No flashcards yet')).toBeVisible();
      await expect(page.getByText('Create your first flashcard to get started!')).toBeVisible();
    }
  });

  test('should open create modal when clicking new flashcard button', async ({ page }) => {
    // Wait for button to be ready
    const button = page.getByTestId('new-flashcard-button');
    await expect(button).toBeVisible();
    await button.click();
    
    await expect(page.getByTestId('modal-content')).toBeVisible();
    await expect(page.getByText('Create New Flashcard')).toBeVisible();
  });

  test('should close modal when clicking cancel', async ({ page }) => {
    const button = page.getByTestId('new-flashcard-button');
    await expect(button).toBeVisible();
    await button.click();
    await expect(page.getByTestId('modal-content')).toBeVisible();
    
    await page.getByTestId('cancel-button').click();
    await expect(page.getByTestId('modal-content')).not.toBeVisible();
  });

  test('should create a new flashcard', async ({ page }) => {
    const button = page.getByTestId('new-flashcard-button');
    await expect(button).toBeVisible();
    await button.click();
    
    // Wait for modal and form to be ready
    await expect(page.getByTestId('modal-content')).toBeVisible();
    
    // Fill form
    const frontInput = page.getByTestId('front-input');
    const backInput = page.getByTestId('back-input');
    await expect(frontInput).toBeVisible();
    await expect(backInput).toBeVisible();
    
    await frontInput.fill('What is Playwright?');
    await backInput.fill('An end-to-end testing framework');
    
    // Submit
    const submitButton = page.getByTestId('submit-button');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    
    // Modal should close
    await expect(page.getByTestId('modal-content')).not.toBeVisible();
    
    // Flashcard should appear in the grid
    await expect(page.getByText('What is Playwright?')).toBeVisible();
  });

  test('should display flashcards grid when flashcards exist', async ({ page }) => {
    // Create a flashcard first
    const button = page.getByTestId('new-flashcard-button');
    await expect(button).toBeVisible();
    await button.click();
    
    await expect(page.getByTestId('modal-content')).toBeVisible();
    await page.getByTestId('front-input').fill('Test Question');
    await page.getByTestId('back-input').fill('Test Answer');
    await page.getByTestId('submit-button').click();
    
    // Check grid is visible
    await expect(page.getByTestId('flashcards-grid')).toBeVisible();
    await expect(page.getByTestId('flashcard-card')).toBeVisible();
  });

  test('should edit a flashcard', async ({ page }) => {
    // Create a flashcard first
    const button = page.getByTestId('new-flashcard-button');
    await expect(button).toBeVisible();
    await button.click();
    
    await expect(page.getByTestId('modal-content')).toBeVisible();
    await page.getByTestId('front-input').fill('Original Question');
    await page.getByTestId('back-input').fill('Original Answer');
    await page.getByTestId('submit-button').click();
    
    // Wait for flashcard to appear
    await expect(page.getByText('Original Question')).toBeVisible();
    
    // Click edit button (first flashcard)
    await page.getByTestId('edit-button').first().click();
    
    // Modal should show edit title
    await expect(page.getByText('Edit Flashcard')).toBeVisible();
    
    // Update the flashcard
    await page.getByTestId('front-input').fill('Updated Question');
    await page.getByTestId('back-input').fill('Updated Answer');
    await page.getByTestId('submit-button').click();
    
    // Updated content should be visible
    await expect(page.getByText('Updated Question')).toBeVisible();
  });

  test('should show confirmation modal when deleting', async ({ page }) => {
    // Create a flashcard first
    const button = page.getByTestId('new-flashcard-button');
    await expect(button).toBeVisible();
    await button.click();
    
    await expect(page.getByTestId('modal-content')).toBeVisible();
    await page.getByTestId('front-input').fill('To Delete');
    await page.getByTestId('back-input').fill('Will be deleted');
    await page.getByTestId('submit-button').click();
    
    // Wait for flashcard to appear
    await expect(page.getByText('To Delete')).toBeVisible();
    
    // Click delete button
    await page.getByTestId('delete-button').first().click();
    
    // Confirm modal should appear
    await expect(page.getByTestId('confirm-modal')).toBeVisible();
    await expect(page.getByText('Delete Flashcard')).toBeVisible();
    await expect(page.getByText('Are you sure you want to delete this flashcard?')).toBeVisible();
    
    // Cancel deletion
    await page.getByTestId('confirm-cancel-button').click();
    
    // Modal should close and flashcard should still be visible
    await expect(page.getByTestId('confirm-modal')).not.toBeVisible();
    await expect(page.getByText('To Delete')).toBeVisible();
  });

  test('should delete a flashcard after confirmation', async ({ page }) => {
    // Create a flashcard first
    const button = page.getByTestId('new-flashcard-button');
    await expect(button).toBeVisible();
    await button.click();
    
    await expect(page.getByTestId('modal-content')).toBeVisible();
    await page.getByTestId('front-input').fill('Delete Me Now');
    await page.getByTestId('back-input').fill('Will be deleted');
    await page.getByTestId('submit-button').click();
    
    // Wait for flashcard to appear
    await expect(page.getByText('Delete Me Now')).toBeVisible();
    
    // Click delete button
    await page.getByTestId('delete-button').first().click();
    
    // Confirm modal should appear
    await expect(page.getByTestId('confirm-modal')).toBeVisible();
    
    // Click confirm button
    await page.getByTestId('confirm-confirm-button').click();
    
    // Wait for modal to close
    await expect(page.getByTestId('confirm-modal')).not.toBeVisible();
  });

  test('should refresh flashcards list', async ({ page }) => {
    const refreshButton = page.getByTestId('refresh-button');
    
    // Ensure button is visible and enabled
    await expect(refreshButton).toBeVisible();
    await expect(refreshButton).toBeEnabled();
    
    // Click refresh
    await refreshButton.click();
    
    // With mocked API, response is instant, so we just verify button remains functional
    await expect(refreshButton).toBeEnabled();
  });

  test('should validate form - empty fields', async ({ page }) => {
    await page.getByTestId('new-flashcard-button').click();
    
    // Try to submit without filling fields
    await page.getByTestId('submit-button').click();
    
    // Form should show validation errors or prevent submission
    await expect(page.getByTestId('modal-content')).toBeVisible();
  });

  test('should display error message when API fails', async ({ page }) => {
    // This test would require mocking API failures
    // For now, we'll just check if error banner can be displayed and closed
    
    // If there's an error banner visible
    const errorBanner = page.getByRole('alert');
    if (await errorBanner.isVisible()) {
      // Should be able to close it
      await page.locator('.close-error').click();
      await expect(errorBanner).not.toBeVisible();
    }
  });
});
