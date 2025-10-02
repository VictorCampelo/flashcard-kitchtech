import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlashcardForm } from './FlashcardForm';
import type { Flashcard } from '../../../types/flashcard';

describe('FlashcardForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('renders create form with empty fields', () => {
      render(<FlashcardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByTestId('front-input')).toHaveValue('');
      expect(screen.getByTestId('back-input')).toHaveValue('');
    });

    it('updates input values when typing', async () => {
      const user = userEvent.setup();
      render(<FlashcardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const frontInput = screen.getByTestId('front-input');
      const backInput = screen.getByTestId('back-input');

      await user.type(frontInput, 'Test Question');
      await user.type(backInput, 'Test Answer');

      expect(frontInput).toHaveValue('Test Question');
      expect(backInput).toHaveValue('Test Answer');
    });

    it('shows character count', async () => {
      const user = userEvent.setup();
      render(<FlashcardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const frontInput = screen.getByTestId('front-input');
      await user.type(frontInput, 'Test');

      expect(screen.getByText('4/1000')).toBeInTheDocument();
    });

    it('submits form with valid data', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      const user = userEvent.setup();
      
      render(<FlashcardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const frontInput = screen.getByTestId('front-input');
      const backInput = screen.getByTestId('back-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(frontInput, 'Test Question');
      await user.type(backInput, 'Test Answer');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          front: 'Test Question',
          back: 'Test Answer',
        });
      });
    });

    it('shows error when submitting empty form', async () => {
      render(<FlashcardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const form = screen.getByTestId('flashcard-form');
      
      // Bypass HTML5 validation by submitting the form directly
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Both question and answer are required')).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('trims whitespace from inputs before submitting', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      const user = userEvent.setup();
      
      render(<FlashcardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const frontInput = screen.getByTestId('front-input');
      const backInput = screen.getByTestId('back-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(frontInput, '  Test Question  ');
      await user.type(backInput, '  Test Answer  ');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          front: 'Test Question',
          back: 'Test Answer',
        });
      });
    });

    it('clears form after successful submission', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      const user = userEvent.setup();
      
      render(<FlashcardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const frontInput = screen.getByTestId('front-input');
      const backInput = screen.getByTestId('back-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(frontInput, 'Test Question');
      await user.type(backInput, 'Test Answer');
      await user.click(submitButton);

      await waitFor(() => {
        expect(frontInput).toHaveValue('');
        expect(backInput).toHaveValue('');
      });
    });

    it('shows error message when submission fails', async () => {
      mockOnSubmit.mockRejectedValue(new Error('Network error'));
      const user = userEvent.setup();
      
      render(<FlashcardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const frontInput = screen.getByTestId('front-input');
      const backInput = screen.getByTestId('back-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(frontInput, 'Test Question');
      await user.type(backInput, 'Test Answer');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('disables inputs and button while submitting', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();
      
      render(<FlashcardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const frontInput = screen.getByTestId('front-input');
      const backInput = screen.getByTestId('back-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(frontInput, 'Test Question');
      await user.type(backInput, 'Test Answer');
      
      await user.click(submitButton);

      // Check immediately after click
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(frontInput).toBeDisabled();
        expect(backInput).toBeDisabled();
      });

      // Wait for submission to complete
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Edit Mode', () => {
    const mockFlashcard: Flashcard = {
      id: 1,
      front: 'Existing Question',
      back: 'Existing Answer',
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z',
      difficulty: 'easy',
      study_count: 0,
      last_studied_at: null,
    };

    it('renders edit form with pre-filled data', () => {
      render(
        <FlashcardForm
          flashcard={mockFlashcard}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('front-input')).toHaveValue('Existing Question');
      expect(screen.getByTestId('back-input')).toHaveValue('Existing Answer');
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Update');
    });

    it('submits updated data', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      const user = userEvent.setup();
      
      render(
        <FlashcardForm
          flashcard={mockFlashcard}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const frontInput = screen.getByTestId('front-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.clear(frontInput);
      await user.type(frontInput, 'Updated Question');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          front: 'Updated Question',
          back: 'Existing Answer',
        });
      });
    });
  });

  describe('Cancel functionality', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<FlashcardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const cancelButton = screen.getByTestId('cancel-button');
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('clears form when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<FlashcardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const frontInput = screen.getByTestId('front-input');
      const backInput = screen.getByTestId('back-input');
      const cancelButton = screen.getByTestId('cancel-button');

      await user.type(frontInput, 'Test');
      await user.type(backInput, 'Test');
      await user.click(cancelButton);

      expect(frontInput).toHaveValue('');
      expect(backInput).toHaveValue('');
    });
  });
});
