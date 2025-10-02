/**
 * Validation Utility Functions
 */

import { MAX_FLASHCARD_LENGTH } from '../constants';

/**
 * Validate flashcard input
 */
export const validateFlashcardInput = (
  front: string,
  back: string
): { isValid: boolean; errors: { front?: string; back?: string } } => {
  const errors: { front?: string; back?: string } = {};

  if (!front.trim()) {
    errors.front = 'Question is required';
  } else if (front.length > MAX_FLASHCARD_LENGTH) {
    errors.front = `Question must not exceed ${MAX_FLASHCARD_LENGTH} characters`;
  }

  if (!back.trim()) {
    errors.back = 'Answer is required';
  } else if (back.length > MAX_FLASHCARD_LENGTH) {
    errors.back = `Answer must not exceed ${MAX_FLASHCARD_LENGTH} characters`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Check if string is empty or whitespace
 */
export const isEmpty = (value: string): boolean => {
  return !value || value.trim().length === 0;
};

/**
 * Sanitize user input (basic XSS prevention)
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
