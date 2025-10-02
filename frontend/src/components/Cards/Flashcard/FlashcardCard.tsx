import React, { useState, useCallback } from 'react';
import type { Flashcard } from '../../../types/flashcard';
import { formatDate } from '../../../utils/formatters';
import './FlashcardCard.css';

interface FlashcardCardProps {
  flashcard: Flashcard;
  onEdit: (flashcard: Flashcard) => void;
  onDelete: (id: number) => void;
}

/**
 * Flashcard Card Component
 * Displays a single flashcard with flip animation
 * Optimized with React.memo and useCallback
 */
export const FlashcardCard: React.FC<FlashcardCardProps> = React.memo(({
  flashcard,
  onEdit,
  onDelete,
}) => {
  // We need to use useState to keep track of the card's flip state
  const [isFlipped, setIsFlipped] = useState(false);

  // We need to use useCallback to memoize the handleFlip function
  // because it's used as an event handler and we don't want it to be recreated on every render
  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  // We need to use useCallback to memoize the handleEdit function
  // because it's used as an event handler and we don't want it to be recreated on every render
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(flashcard);
  }, [flashcard, onEdit]);

  // We need to use useCallback to memoize the handleDelete function
  // because it's used as an event handler and we don't want it to be recreated on every render
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this flashcard?')) {
      onDelete(flashcard.id);
    }
  }, [flashcard.id, onDelete]);

  return (
    <div className="flashcard-wrapper" data-testid="flashcard-card">
      <div
        className={`flashcard-container ${isFlipped ? 'flipped' : ''}`}
        onClick={handleFlip}
      >
        <div className="flashcard-front">
          <div className="flashcard-content">
            <h3>Question</h3>
            <p>{flashcard.front}</p>
          </div>
          <div className="flashcard-hint">Click to flip</div>
        </div>

        <div className="flashcard-back">
          <div className="flashcard-content">
            <h3>Answer</h3>
            <p>{flashcard.back}</p>
          </div>
          <div className="flashcard-hint">Click to flip back</div>
        </div>
      </div>

      <div className="flashcard-actions">
        <button
          onClick={handleEdit}
          className="btn btn-edit"
          data-testid="edit-button"
          aria-label="Edit flashcard"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="btn btn-delete"
          data-testid="delete-button"
          aria-label="Delete flashcard"
        >
          Delete
        </button>
      </div>

      <div className="flashcard-metadata">
        <small>ID: {flashcard.id}</small>
        <small>Created: {formatDate(flashcard.created_at)}</small>
      </div>
    </div>
  );
});

FlashcardCard.displayName = 'FlashcardCard';

export default FlashcardCard;
