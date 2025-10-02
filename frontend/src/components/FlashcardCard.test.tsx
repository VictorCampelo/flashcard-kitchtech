import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlashcardCard } from './FlashcardCard';
import type { Flashcard } from '../types/flashcard';

describe('FlashcardCard', () => {
  const mockFlashcard: Flashcard = {
    id: 1,
    front: 'What is React?',
    back: 'A JavaScript library for building user interfaces',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.confirm = vi.fn(() => true);
  });

  it('renders flashcard with front text initially', () => {
    render(
      <FlashcardCard
        flashcard={mockFlashcard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('What is React?')).toBeInTheDocument();
    expect(screen.getByText('Question')).toBeInTheDocument();
  });

  it('flips to show back text when clicked', () => {
    render(
      <FlashcardCard
        flashcard={mockFlashcard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const card = screen.getByTestId('flashcard-card');
    const container = card.querySelector('.flashcard-container');

    // Initially not flipped
    expect(container).not.toHaveClass('flipped');

    // Click to flip
    fireEvent.click(container!);

    // Should be flipped
    expect(container).toHaveClass('flipped');
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <FlashcardCard
        flashcard={mockFlashcard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockFlashcard);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button is clicked and confirmed', () => {
    render(
      <FlashcardCard
        flashcard={mockFlashcard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalled();
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it('does not call onDelete when deletion is cancelled', () => {
    global.confirm = vi.fn(() => false);

    render(
      <FlashcardCard
        flashcard={mockFlashcard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('displays flashcard metadata correctly', () => {
    render(
      <FlashcardCard
        flashcard={mockFlashcard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/ID: 1/)).toBeInTheDocument();
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
  });

  it('stops event propagation when clicking edit/delete buttons', () => {
    const { container } = render(
      <FlashcardCard
        flashcard={mockFlashcard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const cardContainer = container.querySelector('.flashcard-container');
    const editButton = screen.getByTestId('edit-button');

    // Initially not flipped
    expect(cardContainer).not.toHaveClass('flipped');

    // Click edit button (should not flip card)
    fireEvent.click(editButton);

    // Card should still not be flipped
    expect(cardContainer).not.toHaveClass('flipped');
    expect(mockOnEdit).toHaveBeenCalled();
  });
});
