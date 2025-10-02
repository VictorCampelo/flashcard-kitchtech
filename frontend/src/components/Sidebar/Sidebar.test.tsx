import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { AppProvider } from '../../contexts/AppContext';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<AppProvider>{ui}</AppProvider>);
};

describe('Sidebar', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders sidebar with all navigation items', () => {
      renderWithProvider(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          currentView="home"
          flashcardsCount={5}
        />
      );

      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByText('Flashcard App')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Study Mode')).toBeInTheDocument();
      expect(screen.getByText('Kanban Board')).toBeInTheDocument();
    });

    it('displays flashcard count badge', () => {
      renderWithProvider(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          currentView="home"
          flashcardsCount={10}
        />
      );

      expect(screen.getByTestId('flashcards-count')).toHaveTextContent('10');
    });

    it('does not display badge when flashcard count is 0', () => {
      renderWithProvider(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          currentView="home"
          flashcardsCount={0}
        />
      );

      expect(screen.queryByTestId('flashcards-count')).not.toBeInTheDocument();
    });

    it('highlights active navigation item', () => {
      renderWithProvider(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          currentView="study"
          flashcardsCount={5}
        />
      );

      const studyLink = screen.getByTestId('nav-link-study');
      expect(studyLink).toHaveClass('active');
    });

    it('displays footer with author name', () => {
      renderWithProvider(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          currentView="home"
          flashcardsCount={5}
        />
      );

      expect(screen.getByText('Victor Campelo')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('calls onClose when overlay is clicked', () => {
      renderWithProvider(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          currentView="home"
          flashcardsCount={5}
        />
      );

      const overlay = screen.getByTestId('sidebar-overlay');
      fireEvent.click(overlay);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when navigation link is clicked', () => {
      renderWithProvider(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          currentView="home"
          flashcardsCount={5}
        />
      );

      const homeLink = screen.getByTestId('nav-link-home');
      fireEvent.click(homeLink);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mobile behavior', () => {
    it('applies open class when isOpen is true', () => {
      renderWithProvider(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          currentView="home"
          flashcardsCount={5}
        />
      );

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('open');
    });

    it('does not apply open class when isOpen is false', () => {
      renderWithProvider(
        <Sidebar
          isOpen={false}
          onClose={mockOnClose}
          currentView="home"
          flashcardsCount={5}
        />
      );

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).not.toHaveClass('open');
    });

    it('applies open class to overlay when isOpen is true', () => {
      renderWithProvider(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          currentView="home"
          flashcardsCount={5}
        />
      );

      const overlay = screen.getByTestId('sidebar-overlay');
      expect(overlay).toHaveClass('open');
    });
  });

});
