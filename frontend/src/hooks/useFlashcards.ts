import { useState, useCallback } from 'react';
import FlashcardService from '../services/flashcardService';
import type { Flashcard, CreateFlashcardDTO, UpdateFlashcardDTO } from '../types/flashcard';

interface UseFlashcardsReturn {
  flashcards: Flashcard[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
  loadFlashcards: (page?: number, perPage?: number) => Promise<void>;
  createFlashcard: (data: CreateFlashcardDTO) => Promise<void>;
  updateFlashcard: (id: number, data: UpdateFlashcardDTO) => Promise<void>;
  deleteFlashcard: (id: number) => Promise<void>;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  clearError: () => void;
}

/**
 * Custom Hook for Flashcard Operations
 * Manages flashcard state and API calls
 */
export const useFlashcards = (): UseFlashcardsReturn => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 0,
  });

  const loadFlashcards = useCallback(async (page?: number, perPage?: number) => {
    try {
      setLoading(true);
      setError(null);
      const currentPage = page ?? pagination.page;
      const currentPerPage = perPage ?? pagination.perPage;
      
      const result = await FlashcardService.getPaginated(currentPage, currentPerPage);
      setFlashcards(result.data);
      setPagination({
        page: result.page,
        perPage: result.per_page,
        total: result.total,
        totalPages: result.total_pages,
      });
    } catch (err) {
      setError('Failed to load flashcards. Please try again.');
      console.error('Error loading flashcards:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage]);

  const createFlashcard = useCallback(async (data: CreateFlashcardDTO) => {
    try {
      setError(null);
      const newCard = await FlashcardService.create(data);
      setFlashcards(prev => [newCard, ...prev]);
    } catch (err) {
      setError('Failed to create flashcard.');
      throw err;
    }
  }, []);

  const updateFlashcard = useCallback(async (id: number, data: UpdateFlashcardDTO) => {
    try {
      setError(null);
      const updated = await FlashcardService.update(id, data);
      setFlashcards(prev => prev.map(card => card.id === id ? updated : card));
    } catch (err) {
      setError('Failed to update flashcard.');
      throw err;
    }
  }, []);

  const deleteFlashcard = useCallback(async (id: number) => {
    try {
      setError(null);
      await FlashcardService.delete(id);
      setFlashcards(prev => prev.filter(card => card.id !== id));
    } catch (err) {
      setError('Failed to delete flashcard.');
      console.error('Error deleting flashcard:', err);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setPerPage = useCallback((perPage: number) => {
    setPagination(prev => ({ ...prev, perPage, page: 1 })); // Reset to page 1 when changing per page
  }, []);

  return {
    flashcards,
    loading,
    error,
    pagination,
    loadFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    setPage,
    setPerPage,
    clearError,
  };
};

export default useFlashcards;
