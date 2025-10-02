import { useState, useCallback } from 'react';
import FlashcardService from '../services/flashcardService';
import type { Flashcard, CreateFlashcardDTO, UpdateFlashcardDTO } from '../types/flashcard';

interface UseFlashcardsReturn {
  flashcards: Flashcard[];
  loading: boolean;
  error: string | null;
  loadFlashcards: () => Promise<void>;
  createFlashcard: (data: CreateFlashcardDTO) => Promise<void>;
  updateFlashcard: (id: number, data: UpdateFlashcardDTO) => Promise<void>;
  deleteFlashcard: (id: number) => Promise<void>;
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

  const loadFlashcards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await FlashcardService.getAll();
      setFlashcards(data);
    } catch (err) {
      setError('Failed to load flashcards. Please try again.');
      console.error('Error loading flashcards:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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

  return {
    flashcards,
    loading,
    error,
    loadFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    clearError,
  };
};

export default useFlashcards;
