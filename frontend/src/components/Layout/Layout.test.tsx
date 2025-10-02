import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from './Layout';
import { AppProvider } from '../../contexts/AppContext';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<AppProvider><BrowserRouter>{ui}</BrowserRouter></AppProvider>);
};

describe('Layout', () => {
  const mockOnNewFlashcard = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders layout with children', () => {
      renderWithProvider(
        <Layout flashcardsCount={5} onNewFlashcard={mockOnNewFlashcard}>
          <div data-testid="test-child">Test Content</div>
        </Layout>
      );

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders sidebar component', () => {
      renderWithProvider(
        <Layout flashcardsCount={5} onNewFlashcard={mockOnNewFlashcard}>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('renders bottom bar component', () => {
      renderWithProvider(
        <Layout flashcardsCount={5} onNewFlashcard={mockOnNewFlashcard}>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByTestId('bottom-bar')).toBeInTheDocument();
    });

    it('renders menu button in header', () => {
      renderWithProvider(
        <Layout flashcardsCount={5} onNewFlashcard={mockOnNewFlashcard}>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByTestId('menu-button')).toBeInTheDocument();
    });

    it('displays title when provided', () => {
      renderWithProvider(
        <Layout
          flashcardsCount={5}
          onNewFlashcard={mockOnNewFlashcard}
          title="Test Title"
        >
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('does not display title in header when not provided', () => {
      renderWithProvider(
        <Layout flashcardsCount={5} onNewFlashcard={mockOnNewFlashcard}>
          <div>Test Content</div>
        </Layout>
      );

      const header = screen.getByRole('banner');
      const headingsInHeader = header.querySelectorAll('h1');

      // Should not have h1 in the header (layout-header)
      expect(Array.from(headingsInHeader).some(h1 => h1.classList.contains('layout-header-title'))).toBe(false);
    });
  });

  describe('Sidebar interaction', () => {
    it('sidebar starts closed', () => {
      renderWithProvider(
        <Layout flashcardsCount={5} onNewFlashcard={mockOnNewFlashcard}>
          <div>Test Content</div>
        </Layout>
      );

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).not.toHaveClass('open');
    });

    it('opens sidebar when menu button is clicked', () => {
      renderWithProvider(
        <Layout flashcardsCount={5} onNewFlashcard={mockOnNewFlashcard}>
          <div>Test Content</div>
        </Layout>
      );

      const menuButton = screen.getByTestId('menu-button');
      act(() => {
        fireEvent.click(menuButton);
      });

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('open');
    });

    it('closes sidebar when overlay is clicked', () => {
      renderWithProvider(
        <Layout flashcardsCount={5} onNewFlashcard={mockOnNewFlashcard}>
          <div>Test Content</div>
        </Layout>
      );

      // Open sidebar
      const menuButton = screen.getByTestId('menu-button');
      act(() => {
        fireEvent.click(menuButton);
      });

      // Close sidebar via overlay
      const overlay = screen.getByTestId('sidebar-overlay');
      act(() => {
        fireEvent.click(overlay);
      });

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).not.toHaveClass('open');
    });

    it('toggles sidebar when menu button is clicked multiple times', () => {
      renderWithProvider(
        <Layout flashcardsCount={5} onNewFlashcard={mockOnNewFlashcard}>
          <div>Test Content</div>
        </Layout>
      );

      const menuButton = screen.getByTestId('menu-button');
      const sidebar = screen.getByTestId('sidebar');

      // Initially closed
      expect(sidebar).not.toHaveClass('open');

      // Open
      act(() => {
        fireEvent.click(menuButton);
      });
      expect(sidebar).toHaveClass('open');

      // Close
      act(() => {
        fireEvent.click(menuButton);
      });
      expect(sidebar).not.toHaveClass('open');

      // Open again
      act(() => {
        fireEvent.click(menuButton);
      });
      expect(sidebar).toHaveClass('open');
    });
  });

  describe('Props passing', () => {
    it('passes currentView to Sidebar and BottomBar', () => {
      renderWithProvider(
        <Layout flashcardsCount={5} onNewFlashcard={mockOnNewFlashcard}>
          <div>Test Content</div>
        </Layout>
      );

      // Check that the active link is highlighted in both components
      const sidebarHomeLink = screen.getByTestId('nav-link-home');
      expect(sidebarHomeLink).toHaveClass('active');

      const bottomHomeLink = screen.getByTestId('bottom-nav-home');
      expect(bottomHomeLink).toHaveClass('active');
    });

    it('passes flashcardsCount to Sidebar and BottomBar', () => {
      renderWithProvider(
        <Layout flashcardsCount={10} onNewFlashcard={mockOnNewFlashcard}>
          <div>Test Content</div>
        </Layout>
      );

      // Check badges in both components
      expect(screen.getByTestId('flashcards-count')).toHaveTextContent('10');
      expect(screen.getByTestId('bottom-flashcards-count')).toHaveTextContent('10');
    });

    it('passes onNewFlashcard to BottomBar', () => {
      renderWithProvider(
        <Layout flashcardsCount={5} onNewFlashcard={mockOnNewFlashcard}>
          <div>Test Content</div>
        </Layout>
      );

      const newButton = screen.getByTestId('bottom-new-flashcard');
      act(() => {
        fireEvent.click(newButton);
      });

      expect(mockOnNewFlashcard).toHaveBeenCalledTimes(1);
    });
  });

  describe('Default props', () => {
    it('uses default values when optional props are not provided', () => {
      renderWithProvider(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('bottom-bar')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('menu button has proper aria-label', () => {
      renderWithProvider(
        <Layout flashcardsCount={5} onNewFlashcard={mockOnNewFlashcard}>
          <div>Test Content</div>
        </Layout>
      );

      const menuButton = screen.getByTestId('menu-button');
      expect(menuButton).toHaveAttribute('aria-label', 'Toggle menu');
    });

    it('content area has proper test id for identification', () => {
      renderWithProvider(
        <Layout flashcardsCount={5} onNewFlashcard={mockOnNewFlashcard}>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByTestId('layout-content')).toBeInTheDocument();
    });
  });
});
