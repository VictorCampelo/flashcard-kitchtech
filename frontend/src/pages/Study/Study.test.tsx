import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Study } from './Study';
import { FlashcardService } from '../../services/flashcardService';
import type { Flashcard } from '../../types/flashcard';

// Mock the FlashcardService
vi.mock('../../services/flashcardService');

const mockFlashcards: Flashcard[] = [
  {
    id: 1,
    front: 'What is React?',
    back: 'A JavaScript library for building user interfaces',
    difficulty: 'not_studied',
    study_count: 0,
    last_studied_at: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    front: 'What is TypeScript?',
    back: 'A typed superset of JavaScript',
    difficulty: 'medium',
    study_count: 2,
    last_studied_at: '2024-01-02T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
];

describe('Study Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(FlashcardService.getForStudy).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<Study />);
    expect(screen.getByText(/loading study session/i)).toBeInTheDocument();
  });

  it('renders study card when flashcards are loaded', async () => {
    vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);

    render(<Study />);

    await waitFor(() => {
      expect(screen.getByText('What is React?')).toBeInTheDocument();
    });

    expect(screen.getByText('📚 Study Mode')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('flips card when clicked', async () => {
    vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);

    render(<Study />);

    await waitFor(() => {
      expect(screen.getByText('What is React?')).toBeInTheDocument();
    });

    const card = screen.getByTestId('study-card');
    fireEvent.click(card);

    await waitFor(() => {
      expect(screen.getByText('A JavaScript library for building user interfaces')).toBeInTheDocument();
    });
  });

  it('shows difficulty buttons after flipping card', async () => {
    vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);

    render(<Study />);

    await waitFor(() => {
      expect(screen.getByText('What is React?')).toBeInTheDocument();
    });

    const card = screen.getByTestId('study-card');
    fireEvent.click(card);

    await waitFor(() => {
      expect(screen.getByTestId('difficulty-buttons')).toBeInTheDocument();
    });

    expect(screen.getByTestId('btn-easy')).toBeInTheDocument();
    expect(screen.getByTestId('btn-medium')).toBeInTheDocument();
    expect(screen.getByTestId('btn-hard')).toBeInTheDocument();
  });

  it('updates difficulty and moves to next card', async () => {
    vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);
    vi.mocked(FlashcardService.updateDifficulty).mockResolvedValue(mockFlashcards[0]);

    render(<Study />);

    await waitFor(() => {
      expect(screen.getByText('What is React?')).toBeInTheDocument();
    });

    // Flip card
    const card = screen.getByTestId('study-card');
    fireEvent.click(card);

    await waitFor(() => {
      expect(screen.getByTestId('btn-easy')).toBeInTheDocument();
    });

    // Click easy button
    const easyBtn = screen.getByTestId('btn-easy');
    fireEvent.click(easyBtn);

    await waitFor(() => {
      expect(FlashcardService.updateDifficulty).toHaveBeenCalledWith(1, 'easy');
    });

    // Should move to next card
    await waitFor(() => {
      expect(screen.getByText('What is TypeScript?')).toBeInTheDocument();
    });
  });

  it('shows completion screen after last card', async () => {
    vi.mocked(FlashcardService.getForStudy).mockResolvedValue([mockFlashcards[0]]);
    vi.mocked(FlashcardService.updateDifficulty).mockResolvedValue(mockFlashcards[0]);

    render(<Study />);

    await waitFor(() => {
      expect(screen.getByText('What is React?')).toBeInTheDocument();
    });

    // Flip and rate the card
    const card = screen.getByTestId('study-card');
    fireEvent.click(card);

    await waitFor(() => {
      expect(screen.getByTestId('btn-easy')).toBeInTheDocument();
    });

    const easyBtn = screen.getByTestId('btn-easy');
    fireEvent.click(easyBtn);

    await waitFor(() => {
      expect(screen.getByText(/study session complete/i)).toBeInTheDocument();
    });
  });

  it('navigates to previous card', async () => {
    vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);
    vi.mocked(FlashcardService.updateDifficulty).mockResolvedValue(mockFlashcards[0]);

    render(<Study />);

    await waitFor(() => {
      expect(screen.getByText('What is React?')).toBeInTheDocument();
    });

    // Move to next card
    const card = screen.getByTestId('study-card');
    fireEvent.click(card);

    await waitFor(() => {
      expect(screen.getByTestId('btn-easy')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('btn-easy'));

    await waitFor(() => {
      expect(screen.getByText('What is TypeScript?')).toBeInTheDocument();
    });

    // Go back
    const prevBtn = screen.getByTestId('btn-previous');
    fireEvent.click(prevBtn);

    await waitFor(() => {
      expect(screen.getByText('What is React?')).toBeInTheDocument();
    });
  });

  it('shows empty state when no flashcards', async () => {
    vi.mocked(FlashcardService.getForStudy).mockResolvedValue([]);

    render(<Study />);

    await waitFor(() => {
      expect(screen.getByText(/no flashcards available/i)).toBeInTheDocument();
    });
  });

  it('displays current card difficulty and study count', async () => {
    vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);

    render(<Study />);

    await waitFor(() => {
      expect(screen.getByText('What is React?')).toBeInTheDocument();
    });

    expect(screen.getByText('not studied')).toBeInTheDocument();
    expect(screen.getByText('0 times')).toBeInTheDocument();
  });

  it('handles error when loading flashcards', async () => {
    vi.mocked(FlashcardService.getForStudy).mockRejectedValue(new Error('Network error'));

    render(<Study />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load flashcards/i)).toBeInTheDocument();
    });
  });

  it('handles error when updating difficulty', async () => {
    vi.mocked(FlashcardService.getForStudy).mockResolvedValue(mockFlashcards);
    vi.mocked(FlashcardService.updateDifficulty).mockRejectedValue(new Error('Update failed'));

    render(<Study />);

    await waitFor(() => {
      expect(screen.getByText('What is React?')).toBeInTheDocument();
    });

    const card = screen.getByTestId('study-card');
    fireEvent.click(card);

    await waitFor(() => {
      expect(screen.getByTestId('btn-easy')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('btn-easy'));

    await waitFor(() => {
      expect(screen.getByText(/failed to update difficulty/i)).toBeInTheDocument();
    });
  });
});
