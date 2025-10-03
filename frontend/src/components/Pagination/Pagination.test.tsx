import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  const mockOnPageChange = vi.fn();
  const mockOnPerPageChange = vi.fn();

  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    total: 50,
    perPage: 10,
    onPageChange: mockOnPageChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders pagination component', () => {
      render(<Pagination {...defaultProps} />);

      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('displays correct pagination info', () => {
      render(<Pagination {...defaultProps} />);

      expect(screen.getByText('Showing 1-10 of 50 flashcards')).toBeInTheDocument();
    });

    it('displays correct info for second page', () => {
      render(
        <Pagination
          {...defaultProps}
          currentPage={2}
        />
      );

      expect(screen.getByText('Showing 11-20 of 50 flashcards')).toBeInTheDocument();
    });

    it('displays correct info for last page with partial items', () => {
      render(
        <Pagination
          {...defaultProps}
          currentPage={5}
          total={45}
          totalPages={5}
        />
      );

      expect(screen.getByText('Showing 41-45 of 45 flashcards')).toBeInTheDocument();
    });

    it('does not render when totalPages is 1', () => {
      render(
        <Pagination
          {...defaultProps}
          totalPages={1}
          total={5}
        />
      );

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('does not render when totalPages is 0', () => {
      render(
        <Pagination
          {...defaultProps}
          totalPages={0}
          total={0}
        />
      );

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Buttons', () => {
    it('renders previous and next buttons', () => {
      render(<Pagination {...defaultProps} />);

      expect(screen.getByTestId('pagination-prev')).toBeInTheDocument();
      expect(screen.getByTestId('pagination-next')).toBeInTheDocument();
    });

    it('disables previous button on first page', () => {
      render(<Pagination {...defaultProps} currentPage={1} />);

      const prevButton = screen.getByTestId('pagination-prev');
      expect(prevButton).toBeDisabled();
    });

    it('enables previous button on pages after first', () => {
      render(<Pagination {...defaultProps} currentPage={2} />);

      const prevButton = screen.getByTestId('pagination-prev');
      expect(prevButton).not.toBeDisabled();
    });

    it('disables next button on last page', () => {
      render(<Pagination {...defaultProps} currentPage={5} totalPages={5} />);

      const nextButton = screen.getByTestId('pagination-next');
      expect(nextButton).toBeDisabled();
    });

    it('enables next button on pages before last', () => {
      render(<Pagination {...defaultProps} currentPage={4} totalPages={5} />);

      const nextButton = screen.getByTestId('pagination-next');
      expect(nextButton).not.toBeDisabled();
    });

    it('calls onPageChange with previous page when previous button is clicked', () => {
      render(<Pagination {...defaultProps} currentPage={3} />);

      const prevButton = screen.getByTestId('pagination-prev');
      fireEvent.click(prevButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageChange with next page when next button is clicked', () => {
      render(<Pagination {...defaultProps} currentPage={3} />);

      const nextButton = screen.getByTestId('pagination-next');
      fireEvent.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(4);
    });

    it('does not call onPageChange when previous button is clicked on first page', () => {
      render(<Pagination {...defaultProps} currentPage={1} />);

      const prevButton = screen.getByTestId('pagination-prev');
      fireEvent.click(prevButton);

      expect(mockOnPageChange).not.toHaveBeenCalled();
    });

    it('does not call onPageChange when next button is clicked on last page', () => {
      render(<Pagination {...defaultProps} currentPage={5} totalPages={5} />);

      const nextButton = screen.getByTestId('pagination-next');
      fireEvent.click(nextButton);

      expect(mockOnPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Page Numbers', () => {
    it('displays all page numbers when total pages is 5 or less', () => {
      render(<Pagination {...defaultProps} totalPages={5} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('displays ellipsis when there are many pages', () => {
      render(<Pagination {...defaultProps} currentPage={5} totalPages={10} />);

      const ellipsis = screen.getAllByText('...');
      expect(ellipsis.length).toBeGreaterThan(0);
    });

    it('highlights current page button', () => {
      render(<Pagination {...defaultProps} currentPage={3} />);

      const pageButtons = screen.getAllByRole('button');
      const currentPageButton = pageButtons.find(
        (button) => button.textContent === '3' && button.classList.contains('active')
      );

      expect(currentPageButton).toBeDefined();
    });

    it('disables current page button', () => {
      render(<Pagination {...defaultProps} currentPage={3} />);

      const pageButtons = screen.getAllByRole('button');
      const currentPageButton = pageButtons.find(
        (button) => button.textContent === '3'
      );

      expect(currentPageButton).toBeDisabled();
    });

    it('calls onPageChange when a page number is clicked', () => {
      render(<Pagination {...defaultProps} currentPage={1} totalPages={5} />);

      const pageButtons = screen.getAllByRole('button');
      const page3Button = pageButtons.find(
        (button) => button.textContent === '3' && !button.classList.contains('pagination-prev') && !button.classList.contains('pagination-next')
      );

      if (page3Button) {
        fireEvent.click(page3Button);
        expect(mockOnPageChange).toHaveBeenCalledWith(3);
      }
    });
  });

  describe('Per Page Selector', () => {
    it('does not render per page selector when onPerPageChange is not provided', () => {
      render(<Pagination {...defaultProps} />);

      expect(screen.queryByTestId('per-page-select')).not.toBeInTheDocument();
    });

    it('renders per page selector when onPerPageChange is provided', () => {
      render(
        <Pagination
          {...defaultProps}
          onPerPageChange={mockOnPerPageChange}
        />
      );

      expect(screen.getByTestId('per-page-select')).toBeInTheDocument();
    });

    it('displays current perPage value in selector', () => {
      render(
        <Pagination
          {...defaultProps}
          perPage={20}
          onPerPageChange={mockOnPerPageChange}
        />
      );

      const select = screen.getByTestId('per-page-select') as HTMLSelectElement;
      expect(select.value).toBe('20');
    });

    it('has correct options in per page selector', () => {
      render(
        <Pagination
          {...defaultProps}
          onPerPageChange={mockOnPerPageChange}
        />
      );

      const select = screen.getByTestId('per-page-select');
      const options = select.querySelectorAll('option');

      expect(options).toHaveLength(4);
      expect(options[0].value).toBe('5');
      expect(options[1].value).toBe('10');
      expect(options[2].value).toBe('20');
      expect(options[3].value).toBe('50');
    });

    it('calls onPerPageChange when selector value changes', () => {
      render(
        <Pagination
          {...defaultProps}
          onPerPageChange={mockOnPerPageChange}
        />
      );

      const select = screen.getByTestId('per-page-select');
      fireEvent.change(select, { target: { value: '20' } });

      expect(mockOnPerPageChange).toHaveBeenCalledWith(20);
    });

    it('calls onPerPageChange with correct number type', () => {
      render(
        <Pagination
          {...defaultProps}
          onPerPageChange={mockOnPerPageChange}
        />
      );

      const select = screen.getByTestId('per-page-select');
      fireEvent.change(select, { target: { value: '50' } });

      expect(mockOnPerPageChange).toHaveBeenCalledWith(50);
      expect(typeof mockOnPerPageChange.mock.calls[0][0]).toBe('number');
    });
  });

  describe('Edge Cases', () => {
    it('handles single item correctly', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={1}
          total={1}
          perPage={10}
          onPageChange={mockOnPageChange}
        />
      );

      // Should not render when only 1 page
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('handles large numbers correctly', () => {
      render(
        <Pagination
          currentPage={50}
          totalPages={100}
          total={1000}
          perPage={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText(/Showing 491-500 of 1000/)).toBeInTheDocument();
    });

    it('calculates end item correctly when on last page with partial items', () => {
      render(
        <Pagination
          currentPage={3}
          totalPages={3}
          total={25}
          perPage={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('Showing 21-25 of 25 flashcards')).toBeInTheDocument();
    });

    it('handles zero total correctly', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={0}
          total={0}
          perPage={10}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button labels', () => {
      render(<Pagination {...defaultProps} />);

      expect(screen.getByText('← Previous')).toBeInTheDocument();
      expect(screen.getByText('Next →')).toBeInTheDocument();
    });

    it('has proper select label', () => {
      render(
        <Pagination
          {...defaultProps}
          onPerPageChange={mockOnPerPageChange}
        />
      );

      expect(screen.getByLabelText('Items per page:')).toBeInTheDocument();
    });
  });
});
