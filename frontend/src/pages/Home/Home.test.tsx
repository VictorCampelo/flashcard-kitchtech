import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Home } from './Home';
import type { Flashcard } from '../../types/flashcard';
import React from 'react';

// Mock functions
const mockLoadFlashcards = vi.fn();
const mockCreateFlashcard = vi.fn();
const mockUpdateFlashcard = vi.fn();
const mockDeleteFlashcard = vi.fn();
const mockClearError = vi.fn();

// Mock state
let mockFlashcardsState: Flashcard[] = [];
let mockLoadingState = false;
let mockErrorState: string | null = null;

// Mock the hooks
vi.mock('../../hooks', () => ({
  useFlashcards: () => ({
    flashcards: mockFlashcardsState,
    loading: mockLoadingState,
    error: mockErrorState,
    loadFlashcards: mockLoadFlashcards,
    createFlashcard: mockCreateFlashcard,
    updateFlashcard: mockUpdateFlashcard,
    deleteFlashcard: mockDeleteFlashcard,
    clearError: mockClearError,
  }),
  useToggle: (initialValue: boolean) => {
    const [value, setValue] = React.useState(initialValue);
    return [value, () => setValue(true), (val: boolean) => setValue(val)];
  },
}));

// Mock components
interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  onNewFlashcard?: () => void;
  flashcardsCount?: number;
}

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  icon?: string;
}

interface ModalProps {
  isOpen: boolean;
  children: React.ReactNode;
  title: string;
  onClose: () => void;
}

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

interface FlashcardFormProps {
  flashcard?: Flashcard;
  onSubmit: (data: { front: string; back: string }) => void;
  onCancel: () => void;
}

interface FlashcardCardProps {
  flashcard: Flashcard;
  onEdit: (flashcard: Flashcard) => void;
  onDelete: (id: number) => void;
}

// Mock the CreateFlashcardModal direct import
vi.mock('../../components/Modals/CreateFlashcardModal/CreateFlashcardModal', () => ({
  CreateFlashcardModal: ({ isOpen, children, title, onClose }: ModalProps) =>
    isOpen ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

vi.mock('../../components', () => ({
  Layout: ({ children, title, onNewFlashcard }: LayoutProps) => (
    <div data-testid="layout">
      {title && <h1>{title}</h1>}
      <button onClick={onNewFlashcard} data-testid="layout-new-btn">
        New
      </button>
      {children}
    </div>
  ),
  Loading: ({ message }: { message: string }) => (
    <div data-testid="loading">{message}</div>
  ),
  EmptyState: ({ title, description, actionLabel, onAction }: EmptyStateProps) => (
    <div data-testid="empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
      <button onClick={onAction}>{actionLabel}</button>
    </div>
  ),
  Modal: ({ isOpen, children, title, onClose }: ModalProps) =>
    isOpen ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
        {children}
      </div>
    ) : null,
  ConfirmModal: ({ isOpen, title, message, onConfirm, onCancel, confirmText, cancelText }: ConfirmModalProps) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <h3>{title}</h3>
        <p>{message}</p>
        <button onClick={onCancel} data-testid="confirm-cancel">
          {cancelText || 'Cancel'}
        </button>
        <button onClick={onConfirm} data-testid="confirm-confirm">
          {confirmText || 'Confirm'}
        </button>
      </div>
    ) : null,
  FlashcardForm: ({ flashcard, onSubmit, onCancel }: FlashcardFormProps) => (
    <form data-testid="flashcard-form">
      <input data-testid="form-front" defaultValue={flashcard?.front} />
      <input data-testid="form-back" defaultValue={flashcard?.back} />
      <button
        type="button"
        onClick={() => onSubmit({ front: "test", back: "test" })}
        data-testid="form-submit"
      >
        Submit
      </button>
      <button type="button" onClick={onCancel} data-testid="form-cancel">
        Cancel
      </button>
    </form>
  ),
  FlashcardCard: ({ flashcard, onEdit, onDelete }: FlashcardCardProps) => (
    <div data-testid="flashcard-card">
      <p>{flashcard.front}</p>
      <button
        onClick={() => onEdit(flashcard)}
        data-testid={`edit-${flashcard.id}`}
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(flashcard.id)}
        data-testid={`delete-${flashcard.id}`}
      >
        Delete
      </button>
    </div>
  ),
}));

// Mock AppContext
vi.mock("../../contexts/AppContext", () => ({
  useApp: () => ({
    currentView: "home",
    navigateTo: vi.fn(),
  }),
}));

describe("Home", () => {
  const mockFlashcards: Flashcard[] = [
    {
      id: 1,
      front: "What is React?",
      back: "A JavaScript library",
      difficulty: "easy",
      study_count: 0,
      last_studied_at: null,
      created_at: "2025-01-01T00:00:00.000Z",
      updated_at: "2025-01-01T00:00:00.000Z",
    },
    {
      id: 2,
      front: "What is TypeScript?",
      back: "A typed superset of JavaScript",
      difficulty: "medium",
      study_count: 3,
      last_studied_at: "2025-01-02T00:00:00.000Z",
      created_at: "2025-01-01T00:00:00.000Z",
      updated_at: "2025-01-02T00:00:00.000Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset state to defaults
    mockFlashcardsState = [];
    mockLoadingState = false;
    mockErrorState = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders home page with header', () => {
      render(<Home />);

      expect(screen.getByTestId('home-page')).toBeInTheDocument();
      expect(screen.getByText('🎴 Flashcard App')).toBeInTheDocument();
      expect(
        screen.getByText('Master your knowledge with spaced repetition')
      ).toBeInTheDocument();
    });

    it('renders action buttons', () => {
      render(<Home />);

      expect(screen.getByTestId('new-flashcard-button')).toBeInTheDocument();
      expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
    });

    it('calls loadFlashcards on mount', () => {
      render(<Home />);

      expect(mockLoadFlashcards).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading State', () => {
    it('displays loading indicator when loading', () => {
      mockLoadingState = true;

      render(<Home />);

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Loading flashcards...')).toBeInTheDocument();
    });

    it('disables refresh button when loading', () => {
      mockLoadingState = true;

      render(<Home />);

      const refreshButton = screen.getByTestId('refresh-button');
      expect(refreshButton).toBeDisabled();
    });
  });

  describe("Empty State", () => {
    it("displays empty state when no flashcards", () => {
      render(<Home />);

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByText("No flashcards yet")).toBeInTheDocument();
      expect(
        screen.getByText("Create your first flashcard to get started!")
      ).toBeInTheDocument();
    });

    it("opens create modal from empty state action", () => {
      render(<Home />);

      const createButton = screen.getByText("Create Flashcard");
      fireEvent.click(createButton);

      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByText("Create New Flashcard")).toBeInTheDocument();
    });
  });

  describe('Flashcards Display', () => {
    it('displays flashcards grid when flashcards exist', () => {
      mockFlashcardsState = mockFlashcards;

      render(<Home />);

      expect(screen.getByTestId('flashcards-grid')).toBeInTheDocument();
      expect(screen.getAllByTestId('flashcard-card')).toHaveLength(2);
    });

    it('displays flashcard content', () => {
      mockFlashcardsState = mockFlashcards;

      render(<Home />);

      expect(screen.getByText('What is React?')).toBeInTheDocument();
      expect(screen.getByText('What is TypeScript?')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error banner when error exists', () => {
      mockErrorState = 'Failed to load flashcards';

      render(<Home />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Failed to load flashcards')).toBeInTheDocument();
    });

    it('clears error when close button is clicked', () => {
      mockErrorState = 'Failed to load flashcards';

      render(<Home />);

      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);

      expect(mockClearError).toHaveBeenCalledTimes(1);
    });
  });

  describe("Create Flashcard", () => {
    it("opens create modal when new flashcard button is clicked", () => {
      render(<Home />);

      const newButton = screen.getByTestId("new-flashcard-button");
      fireEvent.click(newButton);

      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByText("Create New Flashcard")).toBeInTheDocument();
    });

    it("calls createFlashcard when form is submitted", async () => {
      mockCreateFlashcard.mockResolvedValue(undefined);

      render(<Home />);

      const newButton = screen.getByTestId("new-flashcard-button");
      fireEvent.click(newButton);

      const submitButton = screen.getByTestId("form-submit");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateFlashcard).toHaveBeenCalledWith({
          front: "test",
          back: "test",
        });
      });
    });

    it("closes modal after successful create", async () => {
      mockCreateFlashcard.mockResolvedValue(undefined);

      render(<Home />);

      const newButton = screen.getByTestId("new-flashcard-button");
      fireEvent.click(newButton);

      expect(screen.getByTestId("modal")).toBeInTheDocument();

      const submitButton = screen.getByTestId("form-submit");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
      });
    });

    it("closes modal when cancel is clicked", () => {
      render(<Home />);

      const newButton = screen.getByTestId("new-flashcard-button");
      fireEvent.click(newButton);

      const cancelButton = screen.getByTestId("form-cancel");
      fireEvent.click(cancelButton);

      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });
  });

  describe('Edit Flashcard', () => {
    it('opens edit modal when edit button is clicked', () => {
      mockFlashcardsState = mockFlashcards;

      render(<Home />);

      const editButton = screen.getByTestId('edit-1');
      fireEvent.click(editButton);

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Edit Flashcard')).toBeInTheDocument();
    });

    it('calls updateFlashcard when edit form is submitted', async () => {
      mockUpdateFlashcard.mockResolvedValue(undefined);
      mockFlashcardsState = mockFlashcards;

      render(<Home />);

      const editButton = screen.getByTestId('edit-1');
      fireEvent.click(editButton);

      const submitButton = screen.getByTestId('form-submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateFlashcard).toHaveBeenCalledWith(1, {
          front: 'test',
          back: 'test',
        });
      });
    });

    it('closes modal after successful update', async () => {
      mockUpdateFlashcard.mockResolvedValue(undefined);
      mockFlashcardsState = mockFlashcards;

      render(<Home />);

      const editButton = screen.getByTestId('edit-1');
      fireEvent.click(editButton);

      const submitButton = screen.getByTestId('form-submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Delete Flashcard', () => {
    it('calls deleteFlashcard when delete is confirmed', async () => {
      mockFlashcardsState = mockFlashcards;

      render(<Home />);

      const deleteButton = screen.getByTestId('delete-1');
      fireEvent.click(deleteButton);

      // Confirm modal should appear
      await waitFor(() => {
        expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
      });

      // Click confirm button
      const confirmButton = screen.getByTestId('confirm-confirm');
      fireEvent.click(confirmButton);

      // deleteFlashcard should be called
      await waitFor(() => {
        expect(mockDeleteFlashcard).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('calls loadFlashcards when refresh button is clicked', () => {
      render(<Home />);

      const refreshButton = screen.getByTestId('refresh-button');
      fireEvent.click(refreshButton);

      expect(mockLoadFlashcards).toHaveBeenCalledTimes(2); // Once on mount, once on click
    });
  });

  describe('Modal Close', () => {
    it('closes modal when modal close button is clicked', () => {
      render(<Home />);

      const newButton = screen.getByTestId('new-flashcard-button');
      fireEvent.click(newButton);

      expect(screen.getByTestId('modal')).toBeInTheDocument();

      const closeButton = screen.getByTestId('modal-close');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('clears editing flashcard when modal is closed', () => {
      mockFlashcardsState = mockFlashcards;

      render(<Home />);

      // Open edit modal
      const editButton = screen.getByTestId('edit-1');
      fireEvent.click(editButton);

      expect(screen.getByText('Edit Flashcard')).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByTestId('modal-close');
      fireEvent.click(closeButton);

      // Open new flashcard modal - should show create, not edit
      const newButton = screen.getByTestId('new-flashcard-button');
      fireEvent.click(newButton);

      expect(screen.getByText('Create New Flashcard')).toBeInTheDocument();
    });
  });
});
