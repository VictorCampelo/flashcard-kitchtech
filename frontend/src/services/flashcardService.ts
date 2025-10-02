import api from './api';
import type {
  Flashcard,
  CreateFlashcardDTO,
  UpdateFlashcardDTO,
  FlashcardListResponse,
  FlashcardResponse,
} from '../types/flashcard';

/**
 * Flashcard Service
 * Handles all API calls related to flashcards
 */
export class FlashcardService {
  /**
   * Get all flashcards
   */
  static async getAll(): Promise<Flashcard[]> {
    const response = await api.get<FlashcardListResponse>('/flashcards');
    return response.data.data;
  }

  /**
   * Get flashcard by ID
   */
  static async getById(id: number): Promise<Flashcard> {
    const response = await api.get<FlashcardResponse>(`/flashcards/${id}`);
    return response.data.data;
  }

  /**
   * Create new flashcard
   */
  static async create(data: CreateFlashcardDTO): Promise<Flashcard> {
    const response = await api.post<FlashcardResponse>('/flashcards', data);
    return response.data.data;
  }

  /**
   * Update existing flashcard
   */
  static async update(id: number, data: UpdateFlashcardDTO): Promise<Flashcard> {
    const response = await api.put<FlashcardResponse>(`/flashcards/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete flashcard
   */
  static async delete(id: number): Promise<void> {
    await api.delete(`/flashcards/${id}`);
  }
}

export default FlashcardService;
