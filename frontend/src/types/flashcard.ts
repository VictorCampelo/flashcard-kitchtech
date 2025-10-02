/**
 * Flashcard Type Definitions
 */

export interface Flashcard {
  id: number;
  front: string;
  back: string;
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
  count: number;
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
