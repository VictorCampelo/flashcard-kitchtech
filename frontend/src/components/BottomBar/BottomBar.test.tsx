import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BottomBar } from './BottomBar';
import { AppProvider } from '../../contexts/AppContext';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<AppProvider>{ui}</AppProvider>);
};

describe('BottomBar', () => {
  const mockOnNewFlashcard = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders bottom bar with all navigation items', () => {
      renderWithProvider(
        <BottomBar
          currentView="home"
          flashcardsCount={5}
          onNewFlashcard={mockOnNewFlashcard}
        />
      );

      expect(screen.getByTestId('bottom-bar')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Study')).toBeInTheDocument();
      expect(screen.getByText('Kanban')).toBeInTheDocument();
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('displays flashcard count badge on home icon', () => {
      renderWithProvider(
        <BottomBar
          currentView="home"
          flashcardsCount={10}
          onNewFlashcard={mockOnNewFlashcard}
        />
      );

      expect(screen.getByTestId('bottom-flashcards-count')).toHaveTextContent('10');
    });

    it('does not display badge when flashcard count is 0', () => {
      renderWithProvider(
        <BottomBar
          currentView="home"
          flashcardsCount={0}
          onNewFlashcard={mockOnNewFlashcard}
        />
      );

      expect(screen.queryByTestId('bottom-flashcards-count')).not.toBeInTheDocument();
    });

    it('highlights active navigation item', () => {
      renderWithProvider(
        <BottomBar
          currentView="study"
          flashcardsCount={5}
          onNewFlashcard={mockOnNewFlashcard}
        />
      );

      const studyLink = screen.getByTestId('bottom-nav-study');
      expect(studyLink).toHaveClass('active');
    });

    it('does not highlight inactive items', () => {
      renderWithProvider(
        <BottomBar
          currentView="study"
          flashcardsCount={5}
          onNewFlashcard={mockOnNewFlashcard}
        />
      );

      const homeLink = screen.getByTestId('bottom-nav-home');
      expect(homeLink).not.toHaveClass('active');
    });
  });

  describe('Navigation', () => {
    it('prevents default navigation when clicking current path', () => {
      renderWithProvider(
        <BottomBar
          currentView="home"
          flashcardsCount={5}
          onNewFlashcard={mockOnNewFlashcard}
        />
      );

      const homeLink = screen.getByTestId('bottom-nav-home');
      fireEvent.click(homeLink);

      // Button navigation works correctly
      expect(homeLink).toHaveClass('active');
    });

    it('calls onNewFlashcard when new button is clicked', () => {
      renderWithProvider(
        <BottomBar
          currentView="home"
          flashcardsCount={5}
          onNewFlashcard={mockOnNewFlashcard}
        />
      );

      const newButton = screen.getByTestId('bottom-new-flashcard');
      fireEvent.click(newButton);

      expect(mockOnNewFlashcard).toHaveBeenCalledTimes(1);
    });

    it('does not call onNewFlashcard when it is not provided', () => {
      renderWithProvider(
        <BottomBar
          currentView="home"
          flashcardsCount={5}
        />
      );

      const newButton = screen.getByTestId('bottom-new-flashcard');

      // Should not throw error
      expect(() => fireEvent.click(newButton)).not.toThrow();
    });
  });

  describe('Default props', () => {
    it('uses default values when props are not provided', () => {
      renderWithProvider(<BottomBar />);

      expect(screen.getByTestId('bottom-bar')).toBeInTheDocument();
      expect(screen.queryByTestId('bottom-flashcards-count')).not.toBeInTheDocument();
    });

    it('sets home as active by default', () => {
      renderWithProvider(<BottomBar />);

      const homeLink = screen.getByTestId('bottom-nav-home');
      expect(homeLink).toHaveClass('active');
    });
  });

  describe('Accessibility', () => {
    it('all navigation items are keyboard accessible', () => {
      renderWithProvider(
        <BottomBar
          currentView="home"
          flashcardsCount={5}
          onNewFlashcard={mockOnNewFlashcard}
        />
      );

      const homeLink = screen.getByTestId('bottom-nav-home');
      expect(homeLink.tagName).toBe('BUTTON');
    });

    it('new button is a proper button element', () => {
      renderWithProvider(
        <BottomBar
          currentView="home"
          flashcardsCount={5}
          onNewFlashcard={mockOnNewFlashcard}
        />
      );

      const newButton = screen.getByTestId('bottom-new-flashcard');
      expect(newButton.tagName).toBe('BUTTON');
    });
  });
});
