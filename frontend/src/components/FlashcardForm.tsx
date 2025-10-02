import { useState, useEffect } from 'react';
import type { Flashcard, CreateFlashcardDTO } from '../types/flashcard';
import './FlashcardForm.css';

interface FlashcardFormProps {
  flashcard?: Flashcard;
  onSubmit: (data: CreateFlashcardDTO) => Promise<void>;
  onCancel: () => void;
}

export const FlashcardForm: React.FC<FlashcardFormProps> = ({
  flashcard,
  onSubmit,
  onCancel,
}) => {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (flashcard) {
      setFront(flashcard.front);
      setBack(flashcard.back);
    }
  }, [flashcard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!front.trim() || !back.trim()) {
      setError('Both question and answer are required');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({ front: front.trim(), back: back.trim() });
      setFront('');
      setBack('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save flashcard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFront('');
    setBack('');
    setError(null);
    onCancel();
  };

  return (
    <form className="flashcard-form" onSubmit={handleSubmit} data-testid="flashcard-form">
      <h2>{flashcard ? 'Edit Flashcard' : 'Create New Flashcard'}</h2>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="front">
          Question (Front) <span className="required">*</span>
        </label>
        <textarea
          id="front"
          data-testid="front-input"
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder="Enter the question..."
          rows={4}
          maxLength={1000}
          disabled={isSubmitting}
          required
        />
        <small className="char-count">{front.length}/1000</small>
      </div>

      <div className="form-group">
        <label htmlFor="back">
          Answer (Back) <span className="required">*</span>
        </label>
        <textarea
          id="back"
          data-testid="back-input"
          value={back}
          onChange={(e) => setBack(e.target.value)}
          placeholder="Enter the answer..."
          rows={4}
          maxLength={1000}
          disabled={isSubmitting}
          required
        />
        <small className="char-count">{back.length}/1000</small>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={handleCancel}
          className="btn btn-secondary"
          disabled={isSubmitting}
          data-testid="cancel-button"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          data-testid="submit-button"
        >
          {isSubmitting ? 'Saving...' : flashcard ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default FlashcardForm;
