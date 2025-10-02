import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Kanban } from './Kanban';
import { FlashcardService } from '../../services/flashcardService';
import type { Flashcard, StudyStats } from '../../types/flashcard';

// Mock the FlashcardService
vi.mock('../../services/flashcardService');

const mockFlashcards: Flashcard[] = [
  {
    id: 1,
    front: 'Not studied card',
    back: 'Answer 1',
    difficulty: 'not_studied',
    study_count: 0,
    last_studied_at: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    front: 'Easy card',
    back: 'Answer 2',
    difficulty: 'easy',
    study_count: 3,
    last_studied_at: '2024-01-03T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
  {
    id: 3,
    front: 'Medium card',
    back: 'Answer 3',
    difficulty: 'medium',
    study_count: 2,
    last_studied_at: '2024-01-02T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 4,
    front: 'Hard card',
    back: 'Answer 4',
    difficulty: 'hard',
    study_count: 5,
    last_studied_at: '2024-01-04T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z',
  },
];

const mockStats: StudyStats = {
  total: 4,
  not_studied: 1,
  easy: 1,
  medium: 1,
  hard: 1,
  total_studies: 10,
  avg_studies_per_card: 2.5,
};

describe('Kanban Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(FlashcardService.getAll).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );
    vi.mocked(FlashcardService.getStats).mockImplementation(
      () => new Promise(() => {})
    );

    render(<Kanban />);
    expect(screen.getByText(/loading kanban board/i)).toBeInTheDocument();
  });

  it('renders kanban board with all columns', async () => {
    vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
    vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

    render(<Kanban />);

    await waitFor(() => {
      expect(screen.getByText('📊 Study Progress Board')).toBeInTheDocument();
    });

    expect(screen.getByText('Not Studied')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Hard')).toBeInTheDocument();
  });

  it('displays statistics overview', async () => {
    vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
    vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

    render(<Kanban />);

    await waitFor(() => {
      expect(screen.getByText('Total Cards')).toBeInTheDocument();
    });

    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('2.5')).toBeInTheDocument();
  });

  it('groups flashcards by difficulty in correct columns', async () => {
    vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
    vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

    render(<Kanban />);

    await waitFor(() => {
      expect(screen.getByText('Not studied card')).toBeInTheDocument();
    });

    expect(screen.getByText('Easy card')).toBeInTheDocument();
    expect(screen.getByText('Medium card')).toBeInTheDocument();
    expect(screen.getByText('Hard card')).toBeInTheDocument();
  });

  it('displays card count in each column header', async () => {
    vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
    vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

    render(<Kanban />);

    await waitFor(() => {
      const columns = screen.getAllByTestId(/column-/);
      expect(columns).toHaveLength(4);
    });

    // Each column should have 1 card based on mockFlashcards
    const columnCounts = screen.getAllByText('1');
    expect(columnCounts.length).toBeGreaterThan(0);
  });

  it('shows card menu when menu button is clicked', async () => {
    vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
    vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

    render(<Kanban />);

    await waitFor(() => {
      expect(screen.getByText('Easy card')).toBeInTheDocument();
    });

    const menuButtons = screen.getAllByTestId('card-menu-btn');
    fireEvent.click(menuButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('card-menu')).toBeInTheDocument();
    });

    expect(screen.getByText('📝 Not Studied')).toBeInTheDocument();
    expect(screen.getByText('😊 Easy')).toBeInTheDocument();
    expect(screen.getByText('🤔 Medium')).toBeInTheDocument();
    expect(screen.getByText('😰 Hard')).toBeInTheDocument();
  });

  it('updates card difficulty when menu option is selected', async () => {
    vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
    vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);
    vi.mocked(FlashcardService.updateDifficulty).mockResolvedValue({
      ...mockFlashcards[1],
      difficulty: 'hard',
    });

    render(<Kanban />);

    await waitFor(() => {
      expect(screen.getByText('Easy card')).toBeInTheDocument();
    });

    const menuButtons = screen.getAllByTestId('card-menu-btn');
    fireEvent.click(menuButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('card-menu')).toBeInTheDocument();
    });

    const hardOption = screen.getByText('😰 Hard');
    fireEvent.click(hardOption);

    await waitFor(() => {
      expect(FlashcardService.updateDifficulty).toHaveBeenCalledWith(
        expect.any(Number),
        'hard'
      );
    });
  });

  it('displays study count for each card', async () => {
    vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
    vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

    render(<Kanban />);

    await waitFor(() => {
      expect(screen.getByText('Easy card')).toBeInTheDocument();
    });

    expect(screen.getByText('📚 3 studies')).toBeInTheDocument();
    expect(screen.getByText('📚 2 studies')).toBeInTheDocument();
    expect(screen.getByText('📚 5 studies')).toBeInTheDocument();
  });

  it('displays last studied date when available', async () => {
    vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
    vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

    render(<Kanban />);

    await waitFor(() => {
      expect(screen.getByText('Easy card')).toBeInTheDocument();
    });

    // Should show dates for cards that have been studied
    const dateElements = screen.getAllByText(/🕐/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('shows empty state for columns with no cards', async () => {
    const singleCardArray = [mockFlashcards[0]];
    vi.mocked(FlashcardService.getAll).mockResolvedValue(singleCardArray);
    vi.mocked(FlashcardService.getStats).mockResolvedValue({
      ...mockStats,
      total: 1,
      not_studied: 1,
      easy: 0,
      medium: 0,
      hard: 0,
    });

    render(<Kanban />);

    await waitFor(() => {
      expect(screen.getByText('Not studied card')).toBeInTheDocument();
    });

    const emptyMessages = screen.getAllByText('No cards here');
    expect(emptyMessages.length).toBe(3); // Easy, Medium, Hard columns should be empty
  });

  it('calculates mastery percentage correctly', async () => {
    vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
    vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

    render(<Kanban />);

    await waitFor(() => {
      expect(screen.getByText('Mastery')).toBeInTheDocument();
    });

    // (easy + medium) / total * 100 = (1 + 1) / 4 * 100 = 50%
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('handles error when loading data', async () => {
    vi.mocked(FlashcardService.getAll).mockRejectedValue(new Error('Network error'));
    vi.mocked(FlashcardService.getStats).mockRejectedValue(new Error('Network error'));

    render(<Kanban />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load kanban data/i)).toBeInTheDocument();
    });
  });

  it('reloads data after updating difficulty', async () => {
    vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
    vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);
    vi.mocked(FlashcardService.updateDifficulty).mockResolvedValue({
      ...mockFlashcards[0],
      difficulty: 'easy',
    });

    render(<Kanban />);

    await waitFor(() => {
      expect(screen.getByText('Not studied card')).toBeInTheDocument();
    });

    // Initial load
    expect(FlashcardService.getAll).toHaveBeenCalledTimes(1);

    const menuButtons = screen.getAllByTestId('card-menu-btn');
    fireEvent.click(menuButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('card-menu')).toBeInTheDocument();
    });

    const easyOption = screen.getByText('😊 Easy');
    fireEvent.click(easyOption);

    await waitFor(() => {
      // Should reload data after update
      expect(FlashcardService.getAll).toHaveBeenCalledTimes(2);
      expect(FlashcardService.getStats).toHaveBeenCalledTimes(2);
    });
  });

  it('displays card ID in each kanban card', async () => {
    vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
    vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

    render(<Kanban />);

    await waitFor(() => {
      expect(screen.getByText('Easy card')).toBeInTheDocument();
    });

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();
    expect(screen.getByText('#4')).toBeInTheDocument();
  });

  it('renders navigation buttons', async () => {
    vi.mocked(FlashcardService.getAll).mockResolvedValue(mockFlashcards);
    vi.mocked(FlashcardService.getStats).mockResolvedValue(mockStats);

    render(<Kanban />);

    await waitFor(() => {
      expect(screen.getByText('📊 Study Progress Board')).toBeInTheDocument();
    });

    expect(screen.getByText('Back to Home')).toBeInTheDocument();
    expect(screen.getByText('Start Studying')).toBeInTheDocument();
  });
});
