import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Kanban } from './Kanban';
import { FlashcardService } from '../../services/flashcardService';
import type { Flashcard, StudyStats } from '../../types/flashcard';

// Mock the FlashcardService
vi.mock('../../services/flashcardService', () => ({
  FlashcardService: {
    getAll: vi.fn(),
    getStats: vi.fn(),
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

// Mock the AppContext to set currentView to 'kanban'
vi.mock('../../contexts/AppContext', () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useApp: () => ({
    currentView: 'kanban',
    navigateTo: vi.fn(),
  }),
}));

const renderWithProvider = (ui: React.ReactElement) => {
  return render(ui);
};

describe('Kanban', () => {
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
    {
      id: 4,
      front: 'What is CSS?',
      back: 'Cascading Style Sheets',
      difficulty: 'hard',
      study_count: 1,
      last_studied_at: '2025-01-04T00:00:00.000Z',
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-04T00:00:00.000Z',
    },
  ];

  const mockStats: StudyStats = {
    total: 4,
    not_studied: 1,
    easy: 1,
    medium: 1,
    hard: 1,
    total_studies: 9,
    avg_studies_per_card: 2.25,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Loading', () => {
    it('renders loading state initially', async () => {
      vi.mocked(FlashcardService.getAll).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      vi.mocked(FlashcardService.getStats).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithProvider(<Kanban />);

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Loading kanban board...')).toBeInTheDocument();
    });

    it('loads flashcards and stats on mount', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(FlashcardService.getAll).toHaveBeenCalledTimes(1);
        expect(FlashcardService.getStats).toHaveBeenCalledTimes(1);
      });
    });

    it('displays kanban board after loading', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(screen.getByText('📊 Study Progress Board')).toBeInTheDocument();
        expect(screen.getByText('Track your flashcard mastery')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when loading fails', async () => {
      vi.mocked(FlashcardService.getAll).mockRejectedValue(new Error('Network error'));
      vi.mocked(FlashcardService.getStats).mockRejectedValue(new Error('Network error'));

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load kanban data')).toBeInTheDocument();
      });
    });

    it('can dismiss error message', async () => {
      vi.mocked(FlashcardService.getAll).mockRejectedValue(new Error('Network error'));
      vi.mocked(FlashcardService.getStats).mockRejectedValue(new Error('Network error'));

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load kanban data')).toBeInTheDocument();
      });

      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Failed to load kanban data')).not.toBeInTheDocument();
      });
    });

    it('displays error when difficulty update fails', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);
      vi.mocked(FlashcardService.updateDifficulty).mockRejectedValue(
        new Error('Update failed')
      );

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      // Open menu and try to change difficulty
      const menuButtons = screen.getAllByTestId('card-menu-btn');
      fireEvent.click(menuButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('card-menu')).toBeInTheDocument();
      });

      const easyButton = screen.getByText('😊 Easy');
      fireEvent.click(easyButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to update difficulty')).toBeInTheDocument();
      });
    });
  });

  describe('Kanban Columns', () => {
    it('displays all four difficulty columns', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(screen.getByTestId('column-not_studied')).toBeInTheDocument();
        expect(screen.getByTestId('column-easy')).toBeInTheDocument();
        expect(screen.getByTestId('column-medium')).toBeInTheDocument();
        expect(screen.getByTestId('column-hard')).toBeInTheDocument();
      });
    });

    it('displays correct column titles and icons', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(screen.getByText('Not Studied')).toBeInTheDocument();
        expect(screen.getByText('Easy')).toBeInTheDocument();
        expect(screen.getByText('Medium')).toBeInTheDocument();
        expect(screen.getByText('Hard')).toBeInTheDocument();
        expect(screen.getByText('📝')).toBeInTheDocument();
        expect(screen.getByText('😊')).toBeInTheDocument();
        expect(screen.getByText('🤔')).toBeInTheDocument();
        expect(screen.getByText('😰')).toBeInTheDocument();
      });
    });

    it('displays correct card count in each column', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        const notStudiedColumn = screen.getByTestId('column-not_studied');
        const easyColumn = screen.getByTestId('column-easy');
        const mediumColumn = screen.getByTestId('column-medium');
        const hardColumn = screen.getByTestId('column-hard');

        expect(notStudiedColumn.querySelector('.column-count')).toHaveTextContent('1');
        expect(easyColumn.querySelector('.column-count')).toHaveTextContent('1');
        expect(mediumColumn.querySelector('.column-count')).toHaveTextContent('1');
        expect(hardColumn.querySelector('.column-count')).toHaveTextContent('1');
      });
    });

    it('displays empty state for columns with no cards', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue([]);
      vi.mocked(FlashcardService.getStats).mockResolvedValue({
        ...mockStats,
        total: 0,
        not_studied: 0,
        easy: 0,
        medium: 0,
        hard: 0,
      });

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        const emptyMessages = screen.getAllByText('No cards here');
        expect(emptyMessages).toHaveLength(4); // One for each column
      });
    });
  });

  describe('Statistics Display', () => {
    it('displays total cards statistic', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(screen.getByText('Total Cards')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
      });
    });

    it('displays total studies statistic', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(screen.getByText('Total Studies')).toBeInTheDocument();
        expect(screen.getByText('9')).toBeInTheDocument();
      });
    });

    it('displays average studies per card', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(screen.getByText('Avg per Card')).toBeInTheDocument();
        expect(screen.getByText('2.25')).toBeInTheDocument();
      });
    });

    it('calculates and displays mastery percentage', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(screen.getByText('Mastery')).toBeInTheDocument();
        // (easy: 1 + medium: 1) / total: 4 = 50%
        expect(screen.getByText('50%')).toBeInTheDocument();
      });
    });

    it('displays 0% mastery when no cards exist', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue([]);
      vi.mocked(FlashcardService.getStats).mockResolvedValue({
        total: 0,
        not_studied: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        total_studies: 0,
        avg_studies_per_card: 0,
      });

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(screen.getByText('0%')).toBeInTheDocument();
      });
    });
  });

  describe('Kanban Cards', () => {
    it('displays flashcard content in cards', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
        expect(screen.getByText('What is TypeScript?')).toBeInTheDocument();
        expect(screen.getByText('What is Vitest?')).toBeInTheDocument();
        expect(screen.getByText('What is CSS?')).toBeInTheDocument();
      });
    });

    it('displays card ID', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText('#2')).toBeInTheDocument();
        expect(screen.getByText('#3')).toBeInTheDocument();
        expect(screen.getByText('#4')).toBeInTheDocument();
      });
    });

    it('displays study count for each card', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(screen.getByText('📚 0 studies')).toBeInTheDocument();
        expect(screen.getByText('📚 3 studies')).toBeInTheDocument();
        expect(screen.getByText('📚 5 studies')).toBeInTheDocument();
        expect(screen.getByText('📚 1 study')).toBeInTheDocument();
      });
    });

    it('displays last studied date when available', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        const lastStudiedElements = screen.getAllByText(/🕐/);
        // Should have 3 cards with last_studied_at (cards 2, 3, 4)
        expect(lastStudiedElements.length).toBeGreaterThan(0);
      });
    });

    it('does not display last studied date when null', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue([mockFlashcards[0]]);
      vi.mocked(FlashcardService.getStats).mockResolvedValue({
        ...mockStats,
        total: 1,
      });

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      // Card 1 has no last_studied_at, so should not show date
      const card = screen.getByText('What is React?').closest('.kanban-card');
      expect(card?.querySelector('.card-last-studied')).not.toBeInTheDocument();
    });
  });

  describe('Card Menu Interaction', () => {
    it('opens menu when menu button is clicked', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue([mockFlashcards[0]]);
      vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      const menuButton = screen.getByTestId('card-menu-btn');
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByTestId('card-menu')).toBeInTheDocument();
      });
    });

    it('displays all difficulty options in menu', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue([mockFlashcards[0]]);
      vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      const menuButton = screen.getByTestId('card-menu-btn');
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByText('📝 Not Studied')).toBeInTheDocument();
        expect(screen.getByText('😊 Easy')).toBeInTheDocument();
        expect(screen.getByText('🤔 Medium')).toBeInTheDocument();
        expect(screen.getByText('😰 Hard')).toBeInTheDocument();
      });
    });

    it('closes menu when menu button is clicked again', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue([mockFlashcards[0]]);
      vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      const menuButton = screen.getByTestId('card-menu-btn');
      
      // Open menu
      fireEvent.click(menuButton);
      await waitFor(() => {
        expect(screen.getByTestId('card-menu')).toBeInTheDocument();
      });

      // Close menu
      fireEvent.click(menuButton);
      await waitFor(() => {
        expect(screen.queryByTestId('card-menu')).not.toBeInTheDocument();
      });
    });
  });

  describe('Difficulty Change', () => {
    it('updates difficulty to easy', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue([mockFlashcards[0]]);
      vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);
      vi.mocked(FlashcardService.updateDifficulty).mockResolvedValue({
        ...mockFlashcards[0],
        difficulty: 'easy',
      });

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      // Open menu
      const menuButton = screen.getByTestId('card-menu-btn');
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByTestId('card-menu')).toBeInTheDocument();
      });

      // Select easy
      const easyButton = screen.getByText('😊 Easy');
      fireEvent.click(easyButton);

      await waitFor(() => {
        expect(FlashcardService.updateDifficulty).toHaveBeenCalledWith(1, 'easy');
      });
    });

    it('moves card to new column after difficulty change', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);
      vi.mocked(FlashcardService.updateDifficulty).mockResolvedValue({
        ...mockFlashcards[0],
        difficulty: 'easy',
      });

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      // Check initial state - card should be in not_studied column
      const notStudiedColumn = screen.getByTestId('column-not_studied');
      expect(notStudiedColumn.querySelector('.column-count')).toHaveTextContent('1');

      const easyColumn = screen.getByTestId('column-easy');
      expect(easyColumn.querySelector('.column-count')).toHaveTextContent('1');

      // Open menu and change difficulty
      const menuButtons = screen.getAllByTestId('card-menu-btn');
      fireEvent.click(menuButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('card-menu')).toBeInTheDocument();
      });

      const easyButton = screen.getByText('😊 Easy');
      fireEvent.click(easyButton);

      await waitFor(() => {
        // After move, not_studied should have 0, easy should have 2
        expect(notStudiedColumn.querySelector('.column-count')).toHaveTextContent('0');
        expect(easyColumn.querySelector('.column-count')).toHaveTextContent('2');
      });
    });

    it('closes menu after selecting difficulty', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue([mockFlashcards[0]]);
      vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);
      vi.mocked(FlashcardService.updateDifficulty).mockResolvedValue({
        ...mockFlashcards[0],
        difficulty: 'medium',
      });

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(screen.getByText('What is React?')).toBeInTheDocument();
      });

      // Open menu
      const menuButton = screen.getByTestId('card-menu-btn');
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByTestId('card-menu')).toBeInTheDocument();
      });

      // Select difficulty
      const mediumButton = screen.getByText('🤔 Medium');
      fireEvent.click(mediumButton);

      await waitFor(() => {
        expect(screen.queryByTestId('card-menu')).not.toBeInTheDocument();
      });
    });
  });

  describe('Navigation Buttons', () => {
    it('displays back to home button', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(screen.getByText('Back to Home')).toBeInTheDocument();
      });
    });

    it('displays start studying button', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        expect(screen.getByText('Start Studying')).toBeInTheDocument();
      });
    });
  });

  describe('Card Grouping', () => {
    it('correctly groups flashcards by difficulty', async () => {
      vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
      vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        const notStudiedColumn = screen.getByTestId('column-not_studied');
        const easyColumn = screen.getByTestId('column-easy');
        const mediumColumn = screen.getByTestId('column-medium');
        const hardColumn = screen.getByTestId('column-hard');

        // Check that each column has the correct card
        expect(notStudiedColumn).toHaveTextContent('What is React?');
        expect(easyColumn).toHaveTextContent('What is Vitest?');
        expect(mediumColumn).toHaveTextContent('What is TypeScript?');
        expect(hardColumn).toHaveTextContent('What is CSS?');
      });
    });

    it('handles multiple cards in same difficulty', async () => {
      const multipleEasyCards: Flashcard[] = [
        { ...mockFlashcards[0], difficulty: 'easy' },
        { ...mockFlashcards[1], difficulty: 'easy' },
        { ...mockFlashcards[2], difficulty: 'easy' },
      ];

      vi.mocked(FlashcardService.getAll).mockResolvedValue(multipleEasyCards);
      vi.mocked(FlashcardService.getStats).mockResolvedValue({
        ...mockStats,
        easy: 3,
        not_studied: 0,
        medium: 0,
        hard: 0,
      });

      renderWithProvider(<Kanban />);

      await waitFor(() => {
        const easyColumn = screen.getByTestId('column-easy');
        expect(easyColumn.querySelector('.column-count')).toHaveTextContent('3');
      });
    });
  });
});
