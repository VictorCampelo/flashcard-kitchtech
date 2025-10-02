import { test, expect } from '@playwright/test';

test.describe('Flashcard App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays the home page with title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Flashcard App');
    await expect(page.locator('text=Master your knowledge')).toBeVisible();
  });

  test('shows new flashcard button', async ({ page }) => {
    await expect(page.getByTestId('new-flashcard-button')).toBeVisible();
  });

  test('can create a new flashcard', async ({ page }) => {
    // Click new flashcard button
    await page.getByTestId('new-flashcard-button').click();

    // Form should be visible
    await expect(page.getByTestId('flashcard-form')).toBeVisible();
    await expect(page.locator('h2:has-text("Create New Flashcard")')).toBeVisible();

    // Fill in the form
    await page.getByTestId('front-input').fill('What is Playwright?');
    await page.getByTestId('back-input').fill('An end-to-end testing framework');

    // Submit the form
    await page.getByTestId('submit-button').click();

    // Wait for flashcard to appear
    await expect(page.getByText('What is Playwright?')).toBeVisible();
  });

  test('can flip a flashcard to see the answer', async ({ page }) => {
    // Create a flashcard first
    await page.getByTestId('new-flashcard-button').click();
    await page.getByTestId('front-input').fill('Test Question');
    await page.getByTestId('back-input').fill('Test Answer');
    await page.getByTestId('submit-button').click();

    // Wait for flashcard to appear
    await expect(page.getByText('Test Question')).toBeVisible();

    // Find and click the flashcard container
    const flashcard = page.getByTestId('flashcard-card').first();
    const container = flashcard.locator('.flashcard-container');
    
    // Click to flip
    await container.click();

    // Card should have flipped class
    await expect(container).toHaveClass(/flipped/);
  });

  test('can edit a flashcard', async ({ page }) => {
    // Create a flashcard first
    await page.getByTestId('new-flashcard-button').click();
    await page.getByTestId('front-input').fill('Original Question');
    await page.getByTestId('back-input').fill('Original Answer');
    await page.getByTestId('submit-button').click();

    // Wait for flashcard to appear
    await expect(page.getByText('Original Question')).toBeVisible();

    // Click edit button
    await page.getByTestId('edit-button').first().click();

    // Form should be visible with pre-filled data
    await expect(page.getByTestId('flashcard-form')).toBeVisible();
    await expect(page.locator('h2:has-text("Edit Flashcard")')).toBeVisible();
    await expect(page.getByTestId('front-input')).toHaveValue('Original Question');

    // Update the question
    await page.getByTestId('front-input').clear();
    await page.getByTestId('front-input').fill('Updated Question');
    await page.getByTestId('submit-button').click();

    // Check updated flashcard appears
    await expect(page.getByText('Updated Question')).toBeVisible();
    await expect(page.getByText('Original Question')).not.toBeVisible();
  });

  test('can delete a flashcard', async ({ page }) => {
    // Create a flashcard first
    await page.getByTestId('new-flashcard-button').click();
    await page.getByTestId('front-input').fill('Question to Delete');
    await page.getByTestId('back-input').fill('Answer to Delete');
    await page.getByTestId('submit-button').click();

    // Wait for flashcard to appear
    await expect(page.getByText('Question to Delete')).toBeVisible();

    // Setup dialog handler
    page.on('dialog', dialog => dialog.accept());

    // Click delete button
    await page.getByTestId('delete-button').first().click();

    // Flashcard should be removed
    await expect(page.getByText('Question to Delete')).not.toBeVisible();
  });

  test('shows validation error for empty form', async ({ page }) => {
    await page.getByTestId('new-flashcard-button').click();

    // Try to submit without filling fields
    await page.getByTestId('submit-button').click();

    // Error message should appear
    await expect(page.getByText('Both question and answer are required')).toBeVisible();
  });

  test('can cancel form', async ({ page }) => {
    await page.getByTestId('new-flashcard-button').click();

    // Fill some data
    await page.getByTestId('front-input').fill('Test');
    await page.getByTestId('back-input').fill('Test');

    // Click cancel
    await page.getByTestId('cancel-button').click();

    // Form should be hidden
    await expect(page.getByTestId('flashcard-form')).not.toBeVisible();
  });

  test('displays total flashcard count', async ({ page }) => {
    // Check initial state
    const footer = page.locator('.page-footer');
    await expect(footer.locator('text=Total flashcards:')).toBeVisible();
  });

  test('shows empty state when no flashcards exist', async ({ page }) => {
    // If there are no flashcards, empty state should show
    const emptyState = page.locator('.empty-state');
    const flashcardsGrid = page.getByTestId('flashcards-grid');

    // Either empty state or grid should be visible
    const hasFlashcards = await flashcardsGrid.isVisible();
    
    if (!hasFlashcards) {
      await expect(emptyState).toBeVisible();
      await expect(emptyState.locator('text=No flashcards yet')).toBeVisible();
    }
  });

  test('refresh button reloads flashcards', async ({ page }) => {
    const refreshButton = page.getByTestId('refresh-button');
    await expect(refreshButton).toBeVisible();
    
    await refreshButton.click();
    
    // Button should be disabled while loading
    await expect(refreshButton).toBeDisabled();
  });

  test('displays character count in form', async ({ page }) => {
    await page.getByTestId('new-flashcard-button').click();

    const frontInput = page.getByTestId('front-input');
    await frontInput.fill('Test');

    // Character count should update
    await expect(page.locator('text=4/1000').first()).toBeVisible();
  });

  test('responsive layout works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByTestId('new-flashcard-button')).toBeVisible();
  });
});

test.describe('Flashcard CRUD Flow', () => {
  test('complete CRUD flow', async ({ page }) => {
    await page.goto('/');

    // CREATE
    await page.getByTestId('new-flashcard-button').click();
    await page.getByTestId('front-input').fill('CRUD Test Question');
    await page.getByTestId('back-input').fill('CRUD Test Answer');
    await page.getByTestId('submit-button').click();
    await expect(page.getByText('CRUD Test Question')).toBeVisible();

    // READ (flip to see answer)
    const flashcard = page.getByTestId('flashcard-card').first();
    const container = flashcard.locator('.flashcard-container');
    await container.click();
    await expect(container).toHaveClass(/flipped/);

    // UPDATE
    await page.getByTestId('edit-button').first().click();
    await page.getByTestId('front-input').clear();
    await page.getByTestId('front-input').fill('Updated CRUD Question');
    await page.getByTestId('submit-button').click();
    await expect(page.getByText('Updated CRUD Question')).toBeVisible();

    // DELETE
    page.on('dialog', dialog => dialog.accept());
    await page.getByTestId('delete-button').first().click();
    await expect(page.getByText('Updated CRUD Question')).not.toBeVisible();
  });
});
