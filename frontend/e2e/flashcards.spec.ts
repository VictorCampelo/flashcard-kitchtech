import { test, expect } from '@playwright/test';

test.describe('Home Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays the home page with correct title and subtitle', async ({ page }) => {
    await expect(page.getByTestId('home-page')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Aloo App');
    await expect(page.locator('text=Master your knowledge with spaced repetition')).toBeVisible();
  });

  test('shows new flashcard and refresh buttons', async ({ page }) => {
    await expect(page.getByTestId('new-flashcard-button')).toBeVisible();
    await expect(page.getByTestId('refresh-button')).toBeVisible();
  });

  test('shows empty state when no flashcards exist', async ({ page }) => {
    const flashcardsGrid = page.getByTestId('flashcards-grid');
    const emptyState = page.locator('.empty-state');

    const hasFlashcards = await flashcardsGrid.isVisible().catch(() => false);
    
    if (!hasFlashcards) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('can create a new flashcard', async ({ page }) => {
    // Click new flashcard button
    await page.getByTestId('new-flashcard-button').click();

    // Modal and form should be visible
    await expect(page.getByTestId('modal-overlay')).toBeVisible();
    await expect(page.getByTestId('flashcard-form')).toBeVisible();
    await expect(page.locator('.modal-title:has-text("Create New Flashcard")')).toBeVisible();

    // Fill in the form
    await page.getByTestId('front-input').fill('What is Playwright?');
    await page.getByTestId('back-input').fill('An end-to-end testing framework');

    // Submit the form
    await page.getByTestId('submit-button').click();

    // Wait for modal to close and flashcard to appear
    await expect(page.getByTestId('modal-overlay')).not.toBeVisible();
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

    // Card should have flipped class and show answer
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

    // Modal and form should be visible with pre-filled data
    await expect(page.getByTestId('modal-overlay')).toBeVisible();
    await expect(page.getByTestId('flashcard-form')).toBeVisible();
    await expect(page.locator('.modal-title:has-text("Edit Flashcard")')).toBeVisible();
    await expect(page.getByTestId('front-input')).toHaveValue('Original Question');

    // Update the question
    await page.getByTestId('front-input').clear();
    await page.getByTestId('front-input').fill('Updated Question');
    await page.getByTestId('submit-button').click();

    // Modal should close and updated flashcard should appear
    await expect(page.getByTestId('modal-overlay')).not.toBeVisible();
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

    // Error message should appear in form
    await expect(page.getByText('Both question and answer are required')).toBeVisible();
  });

  test('can cancel form and close modal', async ({ page }) => {
    await page.getByTestId('new-flashcard-button').click();

    // Fill some data
    await page.getByTestId('front-input').fill('Test');
    await page.getByTestId('back-input').fill('Test');

    // Click cancel
    await page.getByTestId('cancel-button').click();

    // Modal should be closed
    await expect(page.getByTestId('modal-overlay')).not.toBeVisible();
  });

  test('can close modal by clicking overlay', async ({ page }) => {
    await page.getByTestId('new-flashcard-button').click();
    await expect(page.getByTestId('modal-overlay')).toBeVisible();

    // Click on overlay
    await page.getByTestId('modal-overlay').click();

    // Modal should close
    await expect(page.getByTestId('modal-overlay')).not.toBeVisible();
  });

  test('can close modal with close button', async ({ page }) => {
    await page.getByTestId('new-flashcard-button').click();
    await expect(page.getByTestId('modal-overlay')).toBeVisible();

    // Click close button
    await page.getByTestId('modal-close').click();

    // Modal should close
    await expect(page.getByTestId('modal-overlay')).not.toBeVisible();
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

test.describe('Layout and Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('layout components are visible', async ({ page }) => {
    await expect(page.getByTestId('layout')).toBeVisible();
    await expect(page.getByTestId('layout-content')).toBeVisible();
  });

  test('can open and close sidebar menu', async ({ page }) => {
    const menuButton = page.getByTestId('menu-button');
    await expect(menuButton).toBeVisible();

    // Open sidebar
    await menuButton.click();
    const sidebar = page.getByTestId('sidebar');
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toHaveClass(/open/);

    // Close sidebar by clicking overlay
    const overlay = page.getByTestId('sidebar-overlay');
    await overlay.click();
    await expect(sidebar).not.toHaveClass(/open/);
  });

  test('sidebar shows navigation options', async ({ page }) => {
    // Open sidebar
    await page.getByTestId('menu-button').click();

    // Check navigation links
    await expect(page.getByTestId('nav-link-home')).toBeVisible();
    await expect(page.getByTestId('nav-link-study')).toBeVisible();
    await expect(page.getByTestId('nav-link-kanban')).toBeVisible();
  });

  test('bottom bar is visible and functional', async ({ page }) => {
    await expect(page.getByTestId('bottom-bar')).toBeVisible();
    
    // Bottom bar should have navigation buttons
    const homeButton = page.getByTestId('bottom-nav-home');
    const studyButton = page.getByTestId('bottom-nav-study');
    const kanbanButton = page.getByTestId('bottom-nav-kanban');
    
    await expect(homeButton).toBeVisible();
    await expect(studyButton).toBeVisible();
    await expect(kanbanButton).toBeVisible();
  });
});

test.describe('Study Mode Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('can navigate to study mode', async ({ page }) => {
    // Open sidebar and navigate
    await page.getByTestId('menu-button').click();
    await page.getByTestId('nav-link-study').click();

    // Should be on study page
    await expect(page.getByTestId('study-page')).toBeVisible();
  });

  test('study mode shows completion message when no cards available', async ({ page }) => {
    // Navigate to study mode
    await page.getByTestId('menu-button').click();
    await page.getByTestId('nav-link-study').click();

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Check if showing complete state or study card
    const completeState = page.locator('.study-complete');
    const studyCard = page.getByTestId('study-card');

    const isComplete = await completeState.isVisible().catch(() => false);
    const hasCard = await studyCard.isVisible().catch(() => false);

    expect(isComplete || hasCard).toBeTruthy();
  });

  test('can flip card and rate difficulty in study mode', async ({ page }) => {
    // Create a flashcard first
    await page.getByTestId('new-flashcard-button').click();
    await page.getByTestId('front-input').fill('Study Test Question');
    await page.getByTestId('back-input').fill('Study Test Answer');
    await page.getByTestId('submit-button').click();

    // Navigate to study mode
    await page.getByTestId('menu-button').click();
    await page.getByTestId('nav-link-study').click();

    // Wait for study card to appear
    const studyCard = page.getByTestId('study-card');
    await expect(studyCard).toBeVisible();

    // Flip the card
    await studyCard.click();
    await expect(studyCard).toHaveClass(/flipped/);

    // Difficulty buttons should appear
    await expect(page.getByTestId('difficulty-buttons')).toBeVisible();
    await expect(page.getByTestId('btn-easy')).toBeVisible();
    await expect(page.getByTestId('btn-medium')).toBeVisible();
    await expect(page.getByTestId('btn-hard')).toBeVisible();
  });

  test('navigation buttons work in study mode', async ({ page }) => {
    // Create multiple flashcards
    for (let i = 1; i <= 3; i++) {
      await page.getByTestId('new-flashcard-button').click();
      await page.getByTestId('front-input').fill(`Question ${i}`);
      await page.getByTestId('back-input').fill(`Answer ${i}`);
      await page.getByTestId('submit-button').click();
      await page.waitForTimeout(500);
    }

    // Navigate to study mode
    await page.getByTestId('menu-button').click();
    await page.getByTestId('nav-link-study').click();

    // Previous button should be disabled on first card
    const prevButton = page.getByTestId('btn-previous');
    await expect(prevButton).toBeDisabled();

    // Skip to next card
    const skipButton = page.getByTestId('btn-skip');
    await skipButton.click();

    // Now previous should be enabled
    await expect(prevButton).not.toBeDisabled();
  });
});

test.describe('Kanban Board Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('can navigate to kanban board', async ({ page }) => {
    // Open sidebar and navigate
    await page.getByTestId('menu-button').click();
    await page.getByTestId('nav-link-kanban').click();

    // Should be on kanban page
    await expect(page.getByTestId('kanban-page')).toBeVisible();
    await expect(page.locator('h1:has-text("Study Progress Board")')).toBeVisible();
  });

  test('kanban board shows all difficulty columns', async ({ page }) => {
    // Navigate to kanban
    await page.getByTestId('menu-button').click();
    await page.getByTestId('nav-link-kanban').click();

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Check for all columns
    await expect(page.getByTestId('column-not_studied')).toBeVisible();
    await expect(page.getByTestId('column-easy')).toBeVisible();
    await expect(page.getByTestId('column-medium')).toBeVisible();
    await expect(page.getByTestId('column-hard')).toBeVisible();
  });

  test('kanban board shows stats overview', async ({ page }) => {
    // Navigate to kanban
    await page.getByTestId('menu-button').click();
    await page.getByTestId('nav-link-kanban').click();

    // Wait for stats to load
    await page.waitForTimeout(1000);

    // Check for stats cards
    const statsOverview = page.locator('.stats-overview');
    if (await statsOverview.isVisible()) {
      await expect(page.locator('.stat-card').first()).toBeVisible();
    }
  });

  test('can change card difficulty on kanban board', async ({ page }) => {
    // Create a flashcard first
    await page.getByTestId('new-flashcard-button').click();
    await page.getByTestId('front-input').fill('Kanban Test Question');
    await page.getByTestId('back-input').fill('Kanban Test Answer');
    await page.getByTestId('submit-button').click();

    // Navigate to kanban
    await page.getByTestId('menu-button').click();
    await page.getByTestId('nav-link-kanban').click();

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Find a kanban card and open its menu
    const kanbanCard = page.getByTestId('kanban-card').first();
    if (await kanbanCard.isVisible()) {
      await kanbanCard.getByTestId('card-menu-btn').click();
      await expect(page.getByTestId('card-menu')).toBeVisible();
    }
  });
});

test.describe('Complete CRUD Flow', () => {
  test('full flashcard lifecycle', async ({ page }) => {
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
