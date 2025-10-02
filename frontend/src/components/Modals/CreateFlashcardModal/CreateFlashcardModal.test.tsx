import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateFlashcardModal } from './CreateFlashcardModal';

describe('Modal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = 'unset';
  });

  describe('Rendering', () => {
    it('does not render when isOpen is false', () => {
      render(
        <CreateFlashcardModal isOpen={false} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </CreateFlashcardModal>
      );

      expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
    });

    it('renders when isOpen is true', () => {
      render(
        <CreateFlashcardModal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </CreateFlashcardModal>
      );

      expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });

    it('displays the correct title', () => {
      render(
        <CreateFlashcardModal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </CreateFlashcardModal>
      );

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('renders children content', () => {
      render(
        <CreateFlashcardModal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div data-testid="modal-child">Modal Content</div>
        </CreateFlashcardModal>
      );

      expect(screen.getByTestId('modal-child')).toBeInTheDocument();
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });
  });

  describe('Close functionality', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <CreateFlashcardModal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </CreateFlashcardModal>
      );

      const closeButton = screen.getByTestId('modal-close');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when overlay is clicked', async () => {
      const user = userEvent.setup();
      render(
        <CreateFlashcardModal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </CreateFlashcardModal>
      );

      const overlay = screen.getByTestId('modal-overlay');
      await user.click(overlay);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when modal content is clicked', async () => {
      const user = userEvent.setup();
      render(
        <CreateFlashcardModal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </CreateFlashcardModal>
      );

      const content = screen.getByTestId('modal-content');
      await user.click(content);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('calls onClose when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(
        <CreateFlashcardModal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </CreateFlashcardModal>
      );

      await user.keyboard('{Escape}');

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Body scroll lock', () => {
    it('locks body scroll when modal is open', () => {
      const { rerender } = render(
        <CreateFlashcardModal isOpen={false} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </CreateFlashcardModal>
      );

      expect(document.body.style.overflow).toBe('unset');

      rerender(
        <CreateFlashcardModal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </CreateFlashcardModal>
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('unlocks body scroll when modal is closed', () => {
      const { rerender } = render(
        <CreateFlashcardModal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </CreateFlashcardModal>
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <CreateFlashcardModal isOpen={false} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </CreateFlashcardModal>
      );

      expect(document.body.style.overflow).toBe('unset');
    });

    it('unlocks body scroll when component is unmounted', () => {
      const { unmount } = render(
        <CreateFlashcardModal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </CreateFlashcardModal>
      );

      expect(document.body.style.overflow).toBe('hidden');

      unmount();

      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label on close button', () => {
      render(
        <CreateFlashcardModal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </CreateFlashcardModal>
      );

      const closeButton = screen.getByTestId('modal-close');
      expect(closeButton).toHaveAttribute('aria-label', 'Close modal');
    });

    it('close button has visible text content', () => {
      render(
        <CreateFlashcardModal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </CreateFlashcardModal>
      );

      const closeButton = screen.getByTestId('modal-close');
      expect(closeButton).toHaveTextContent('×');
    });
  });

  describe('Keyboard navigation cleanup', () => {
    it('removes event listener when modal closes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <CreateFlashcardModal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </CreateFlashcardModal>
      );

      // Escape should work when modal is open
      await user.keyboard('{Escape}');
      expect(mockOnClose).toHaveBeenCalledTimes(1);

      mockOnClose.mockClear();

      // Close the modal
      rerender(
        <CreateFlashcardModal isOpen={false} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </CreateFlashcardModal>
      );

      // Escape should not trigger onClose when modal is closed
      await user.keyboard('{Escape}');
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
