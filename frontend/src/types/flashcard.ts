/**
 * Flashcard Type Definitions
 */

export type DifficultyLevel = 'not_studied' | 'easy' | 'medium' | 'hard';

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  difficulty: DifficultyLevel;
  study_count: number;
  last_studied_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateFlashcardDTO {
  front: string;
  back: string;
}

export interface UpdateFlashcardDTO {
  front: string;
  back: string;
}

export interface FlashcardListResponse {
  success: boolean;
  data: Flashcard[];
  count?: number; // Deprecated, use pagination metadata
  total?: number;
  page?: number;
  per_page?: number;
  total_pages?: number;
}

export interface PaginatedFlashcardResponse {
  success: boolean;
  data: Flashcard[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface FlashcardResponse {
  success: boolean;
  data: Flashcard;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  errors?: Record<string, string>;
}

export interface StudyStats {
  total: number;
  not_studied: number;
  easy: number;
  medium: number;
  hard: number;
  total_studies: number;
  avg_studies_per_card: number;
}

export interface UpdateDifficultyDTO {
  difficulty: DifficultyLevel;
}
