import api from './api';
import type {
  Flashcard,
  CreateFlashcardDTO,
  UpdateFlashcardDTO,
  FlashcardListResponse,
  FlashcardResponse,
  StudyStats,
  UpdateDifficultyDTO,
  DifficultyLevel,
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

  /**
   * Get flashcards for study mode (prioritized by difficulty)
   * Uses query parameter: ?filter=study
   */
  static async getForStudy(): Promise<Flashcard[]> {
    const response = await api.get<FlashcardListResponse>('/flashcards?filter=study');
    return response.data.data;
  }

  /**
   * Update flashcard difficulty after study
   */
  static async updateDifficulty(id: number, difficulty: DifficultyLevel): Promise<Flashcard> {
    const data: UpdateDifficultyDTO = { difficulty };
    const response = await api.patch<FlashcardResponse>(`/flashcards/${id}/difficulty`, data);
    return response.data.data;
  }

  /**
   * Get study statistics
   */
  static async getStats(): Promise<StudyStats> {
    const response = await api.get<{ success: boolean; data: StudyStats }>('/flashcards/stats');
    return response.data.data;
  }

  /**
   * Get flashcards by difficulty level
   * Uses query parameter: ?difficulty={level}
   */
  static async getByDifficulty(difficulty: DifficultyLevel): Promise<Flashcard[]> {
    const response = await api.get<FlashcardListResponse>(`/flashcards?difficulty=${difficulty}`);
    return response.data.data;
  }
}

export default FlashcardService;
