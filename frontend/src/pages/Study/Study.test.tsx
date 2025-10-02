import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Study } from './Study';
import { FlashcardService } from '../../services/flashcardService';
import type { Flashcard } from '../../types/flashcard';

// Mock the FlashcardService
vi.mock('../../services/flashcardService', () => ({
  FlashcardService: {
    getForStudy: vi.fn(),
    updateDifficulty: vi.fn(),
  },
}));

// Mock the Layout component
vi.mock('../../components', () => ({
  Layout: ({ children, title }: { children: React.ReactNode; title?: string }) => (
    <div data-testid="layout">
      {title && <h1>{title}</h1>}
      {children}
    </div>
  ),
  Loading: ({ message }: { message: string }) => (
    <div data-testid="loading">{message}</div>
  ),
}));

// Mock the AppContext to set currentView to 'study'
vi.mock('../../contexts/AppContext', () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useApp: () => ({
    currentView: 'study',
    navigateTo: vi.fn(),
  }),
}));

const renderWithProvider = (ui: React.ReactElement) => {
  return render(ui);
};

describe('Study', () => {
  const mockFlashcards: Flashcard[] = [
    {
      id: 1,
      front: 'What is React?',
      back: 'A JavaScript library for building user interfaces',
      difficulty: 'not_studied',
      study_count: 0,
      last_studied_at: null,
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      front: 'What is TypeScript?',
      back: 'A typed superset of JavaScript',
      difficulty: 'medium',
      study_count: 3,
      last_studied_at: '2025-01-02T00:00:00.000Z',
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-02T00:00:00.000Z',
    },
    {
      id: 3,
      front: 'What is Vitest?',
      back: 'A blazing fast unit test framework',
      difficulty: 'easy',
      study_count: 5,
      last_studied_at: '2025-01-03T00:00:00.000Z',
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-03T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Loading', () => {
    it('renders loading state initially', async () => {
      vi.mocked(FlashcardService.getForStudy).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithProvider(<Study />);

      // Check that loading appears immediately
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Loading study session...')).toBeInTheDocument();
    });

    it('loads flashcards on mount when currentView is study', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(FlashcardService.getForStudy).toHaveBeenCalledTimes(1);
      });
    });

    it('displays first flashcard after loading', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
        expect(screen.getByText('Question')).toBeInTheDocument();
      });
    });

    it('displays progress indicator with correct values', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('Card 1 of 3')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays empty state when loading fails and no flashcards loaded', async () => {
      vi.mocked(FlashcardService.getForStudy).mockRejectedValue(
        new Error('Network error')
      );

      renderWithProvider(<Study />);

      await waitFor(() => {
        // After error and loading completes, shows empty state since flashcards.length === 0
        expect(screen.getByText('Study Session Complete!')).toBeInTheDocument();
        expect(screen.getByText('No flashcards available to study.')).toBeInTheDocument();
      });
    });

    it('displays error when difficulty update fails', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.updateDifficulty).mockRejectedValue(
        new Error('Update failed')
      );

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      // Flip card
      const card = screen.getByTestId('study-card');
      fireEvent.click(card);

      await waitFor(() => {
        expect(screen.getByTestId('difficulty-buttons')).toBeInTheDocument();
      });

      // Click difficulty button
      const easyButton = screen.getByTestId('btn-easy');
      fireEvent.click(easyButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to update difficulty')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('displays empty state when no flashcards available', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue([]);

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('Study Session Complete!')).toBeInTheDocument();
        expect(screen.getByText('No flashcards available to study.')).toBeInTheDocument();
      });
    });

    it('shows restart and back to home buttons in empty state', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue([]);

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('Start New Session')).toBeInTheDocument();
        expect(screen.getByText('Back to Home')).toBeInTheDocument();
      });
    });
  });

  describe('Card Flipping', () => {
    it('flips card when clicked', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      const card = screen.getByTestId('study-card');
      expect(card).not.toHaveClass('flipped');

      fireEvent.click(card);

      await waitFor(() => {
        expect(card).toHaveClass('flipped');
      });
    });

    it('shows difficulty buttons when card is flipped', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      // Initially difficulty buttons should not be visible
      expect(screen.queryByTestId('difficulty-buttons')).not.toBeInTheDocument();

      // Flip card
      const card = screen.getByTestId('study-card');
      fireEvent.click(card);

      await waitFor(() => {
        expect(screen.getByTestId('difficulty-buttons')).toBeInTheDocument();
        expect(screen.getByTestId('btn-easy')).toBeInTheDocument();
        expect(screen.getByTestId('btn-medium')).toBeInTheDocument();
        expect(screen.getByTestId('btn-hard')).toBeInTheDocument();
      });
    });

    it('flips card back when clicked again', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      const card = screen.getByTestId('study-card');

      // Flip
      fireEvent.click(card);
      await waitFor(() => {
        expect(card).toHaveClass('flipped');
      });

      // Flip back
      fireEvent.click(card);
      await waitFor(() => {
        expect(card).not.toHaveClass('flipped');
      });
    });
  });

  describe('Navigation', () => {
    it('disables previous button on first card', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      const previousButton = screen.getByTestId('btn-previous');
      expect(previousButton).toBeDisabled();
    });

    it('disables skip button on last card', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      // Navigate to last card
      const skipButton = screen.getByTestId('btn-skip');
      fireEvent.click(skipButton);
      fireEvent.click(skipButton);

      await waitFor(() => {
        expect(screen.getByText('What is Vitest?')).toBeInTheDocument();
        expect(skipButton).toBeDisabled();
      });
    });

    it('navigates to next card when skip is clicked', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      const skipButton = screen.getByTestId('btn-skip');
      fireEvent.click(skipButton);

      await waitFor(() => {
        expect(screen.getByText('What is TypeScript?')).toBeInTheDocument();
        expect(screen.getByText('Card 2 of 3')).toBeInTheDocument();
      });
    });

    it('navigates to previous card when previous is clicked', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      // Go to second card
      const skipButton = screen.getByTestId('btn-skip');
      fireEvent.click(skipButton);

      await waitFor(() => {
        expect(screen.getByText('What is TypeScript?')).toBeInTheDocument();
      });

      // Go back to first card
      const previousButton = screen.getByTestId('btn-previous');
      fireEvent.click(previousButton);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
        expect(screen.getByText('Card 1 of 3')).toBeInTheDocument();
      });
    });

    it('resets flip state when navigating between cards', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      // Flip card
      const card = screen.getByTestId('study-card');
      fireEvent.click(card);

      await waitFor(() => {
        expect(card).toHaveClass('flipped');
      });

      // Navigate to next card
      const skipButton = screen.getByTestId('btn-skip');
      fireEvent.click(skipButton);

      await waitFor(() => {
        expect(screen.getByText('What is TypeScript?')).toBeInTheDocument();
        expect(card).not.toHaveClass('flipped');
      });
    });
  });

  describe('Difficulty Rating', () => {
    it('updates difficulty to easy and moves to next card', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.updateDifficulty).mockResolvedValue({
        ...mockFlashcards[0],
        difficulty: 'easy',
        study_count: 1,
      });

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      // Flip card
      const card = screen.getByTestId('study-card');
      fireEvent.click(card);

      await waitFor(() => {
        expect(screen.getByTestId('difficulty-buttons')).toBeInTheDocument();
      });

      // Click easy button
      const easyButton = screen.getByTestId('btn-easy');
      fireEvent.click(easyButton);

      await waitFor(() => {
        expect(FlashcardService.updateDifficulty).toHaveBeenCalledWith(1, 'easy');
        expect(screen.getByText('What is TypeScript?')).toBeInTheDocument();
      });
    });

    it('updates difficulty to medium and moves to next card', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.updateDifficulty).mockResolvedValue({
        ...mockFlashcards[0],
        difficulty: 'medium',
        study_count: 1,
      });

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      // Flip card
      const card = screen.getByTestId('study-card');
      fireEvent.click(card);

      await waitFor(() => {
        expect(screen.getByTestId('difficulty-buttons')).toBeInTheDocument();
      });

      // Click medium button
      const mediumButton = screen.getByTestId('btn-medium');
      fireEvent.click(mediumButton);

      await waitFor(() => {
        expect(FlashcardService.updateDifficulty).toHaveBeenCalledWith(1, 'medium');
        expect(screen.getByText('What is TypeScript?')).toBeInTheDocument();
      });
    });

    it('updates difficulty to hard and moves to next card', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.updateDifficulty).mockResolvedValue({
        ...mockFlashcards[0],
        difficulty: 'hard',
        study_count: 1,
      });

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      // Flip card
      const card = screen.getByTestId('study-card');
      fireEvent.click(card);

      await waitFor(() => {
        expect(screen.getByTestId('difficulty-buttons')).toBeInTheDocument();
      });

      // Click hard button
      const hardButton = screen.getByTestId('btn-hard');
      fireEvent.click(hardButton);

      await waitFor(() => {
        expect(FlashcardService.updateDifficulty).toHaveBeenCalledWith(1, 'hard');
        expect(screen.getByText('What is TypeScript?')).toBeInTheDocument();
      });
    });

    it('shows completion screen after rating last card', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue([mockFlashcards[0]]);
      vi.mocked(FlashcardService.updateDifficulty).mockResolvedValue({
        ...mockFlashcards[0],
        difficulty: 'easy',
        study_count: 1,
      });

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      // Flip card
      const card = screen.getByTestId('study-card');
      fireEvent.click(card);

      await waitFor(() => {
        expect(screen.getByTestId('difficulty-buttons')).toBeInTheDocument();
      });

      // Click easy button
      const easyButton = screen.getByTestId('btn-easy');
      fireEvent.click(easyButton);

      await waitFor(() => {
        expect(screen.getByText('Study Session Complete!')).toBeInTheDocument();
        expect(screen.getByText("You've reviewed all 1 flashcards.")).toBeInTheDocument();
      });
    });
  });

  describe('Progress Bar', () => {
    it('updates progress bar as user advances through cards', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('Card 1 of 3')).toBeInTheDocument();
      });

      const progressFill = document.querySelector('.progress-fill') as HTMLElement;
      expect(progressFill.style.width).toMatch(/^33\.33/);

      // Navigate to second card
      const skipButton = screen.getByTestId('btn-skip');
      fireEvent.click(skipButton);

      await waitFor(() => {
        expect(screen.getByText('Card 2 of 3')).toBeInTheDocument();
      });

      expect(progressFill.style.width).toMatch(/^66\.66/);

      // Navigate to third card
      fireEvent.click(skipButton);

      await waitFor(() => {
        expect(screen.getByText('Card 3 of 3')).toBeInTheDocument();
      });

      expect(progressFill.style.width).toBe('100%');
    });
  });

  describe('Study Info Display', () => {
    it('displays current card difficulty badge', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      const badge = document.querySelector('.difficulty-badge');
      expect(badge).toHaveClass('badge-not_studied');
      expect(badge).toHaveTextContent('not studied');
    });

    it('displays study count for current card', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      expect(screen.getByText('0x studied')).toBeInTheDocument();

      // Navigate to second card
      const skipButton = screen.getByTestId('btn-skip');
      fireEvent.click(skipButton);

      await waitFor(() => {
        expect(screen.getByText('What is TypeScript?')).toBeInTheDocument();
        expect(screen.getByText('3x studied')).toBeInTheDocument();
      });
    });
  });

  describe('Study Complete Screen', () => {
    it('displays completion message with flashcard count', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.updateDifficulty).mockResolvedValue({
        ...mockFlashcards[2],
        difficulty: 'easy',
        study_count: 6,
      });

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      // Navigate to last card
      const skipButton = screen.getByTestId('btn-skip');
      fireEvent.click(skipButton);
      fireEvent.click(skipButton);

      await waitFor(() => {
        expect(screen.getByText('What is Vitest?')).toBeInTheDocument();
      });

      // Flip and rate the last card
      const card = screen.getByTestId('study-card');
      fireEvent.click(card);

      await waitFor(() => {
        expect(screen.getByTestId('difficulty-buttons')).toBeInTheDocument();
      });

      const easyButton = screen.getByTestId('btn-easy');
      fireEvent.click(easyButton);

      await waitFor(() => {
        expect(screen.getByText('Study Session Complete!')).toBeInTheDocument();
        expect(screen.getByText("You've reviewed all 3 flashcards.")).toBeInTheDocument();
      });
    });

    it('restarts study session when restart button is clicked', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue([]);

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('Study Session Complete!')).toBeInTheDocument();
      });

      vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);

      const restartButton = screen.getByText('Start New Session');
      fireEvent.click(restartButton);

      await waitFor(() => {
        expect(FlashcardService.getForStudy).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Card Content Display', () => {
    it('displays question label and content on front', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('Question')).toBeInTheDocument();
        expect(screen.getByText('What is React?')).toBeInTheDocument();
        expect(screen.getByText('Click to reveal answer')).toBeInTheDocument();
      });
    });

    it('displays answer label and content on back when flipped', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      // Flip card
      const card = screen.getByTestId('study-card');
      fireEvent.click(card);

      await waitFor(() => {
        expect(screen.getByText('Answer')).toBeInTheDocument();
        expect(screen.getByText('A JavaScript library for building user interfaces')).toBeInTheDocument();
        expect(screen.getByText('Click to flip back')).toBeInTheDocument();
      });
    });
  });

  describe('Local State Updates', () => {
    it('updates local flashcard state after difficulty change', async () => {
      vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.updateDifficulty).mockResolvedValue({
        ...mockFlashcards[0],
        difficulty: 'easy',
        study_count: 1,
      });

      renderWithProvider(<Study />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
        expect(screen.getByText('0x studied')).toBeInTheDocument();
      });

      // Flip and rate card
      const card = screen.getByTestId('study-card');
      fireEvent.click(card);

      await waitFor(() => {
        expect(screen.getByTestId('difficulty-buttons')).toBeInTheDocument();
      });

      const easyButton = screen.getByTestId('btn-easy');
      fireEvent.click(easyButton);

      // Move to second card and back to first
      await waitFor(() => {
        expect(screen.getByText('What is TypeScript?')).toBeInTheDocument();
      });

      const previousButton = screen.getByTestId('btn-previous');
      fireEvent.click(previousButton);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
        // Study count should be updated in local state
        expect(screen.getByText('1x studied')).toBeInTheDocument();
      });
    });
  });
});
