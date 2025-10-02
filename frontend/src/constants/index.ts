/**
 * Application Constants
 */

export const APP_NAME = 'Flashcard App';
export const APP_VERSION = '1.0.0';

export const API_TIMEOUT = 10000; // 10 seconds

export const MAX_FLASHCARD_LENGTH = 1000;

export const ERROR_MESSAGES = {
  LOAD_FAILED: 'Failed to load flashcards. Please try again.',
  CREATE_FAILED: 'Failed to create flashcard.',
  UPDATE_FAILED: 'Failed to update flashcard.',
  DELETE_FAILED: 'Failed to delete flashcard.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  VALIDATION_ERROR: 'Both question and answer are required.',
} as const;

export const SUCCESS_MESSAGES = {
  CREATE_SUCCESS: 'Flashcard created successfully!',
  UPDATE_SUCCESS: 'Flashcard updated successfully!',
  DELETE_SUCCESS: 'Flashcard deleted successfully!',
} as const;

export const EMPTY_STATE = {
  TITLE: 'No flashcards yet',
  DESCRIPTION: 'Create your first flashcard to get started!',
  ICON: '📭',
  ACTION_LABEL: 'Create Flashcard',
} as const;

export const LOADING_MESSAGES = {
  DEFAULT: 'Loading...',
  FLASHCARDS: 'Loading flashcards...',
  SAVING: 'Saving...',
  DELETING: 'Deleting...',
} as const;
