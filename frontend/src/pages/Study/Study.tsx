import React, { useState, useEffect, useCallback } from 'react';
import { FlashcardService } from '../../services/flashcardService';
import { Loading, Layout } from '../../components';
import { useApp } from '../../contexts/AppContext';
import type { Flashcard, DifficultyLevel } from '../../types/flashcard';
import './Study.css';

/**
 * Study Mode Page
 * Shows one flashcard at a time for focused study with difficulty rating
 */
export const Study: React.FC = () => {
  const { navigateTo, currentView } = useApp();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studyComplete, setStudyComplete] = useState(false);

  const currentCard = flashcards[currentIndex];
  const progress = flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0;

  useEffect(() => {
    if (currentView === 'study') {
      loadFlashcards();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

  const loadFlashcards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const cards = await FlashcardService.getForStudy();
      setFlashcards(cards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setStudyComplete(cards.length === 0);
    } catch (err) {
      setError('Failed to load flashcards for study');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleDifficulty = useCallback(async (difficulty: DifficultyLevel) => {
    if (!currentCard) return;

    try {
      await FlashcardService.updateDifficulty(currentCard.id, difficulty);
      
      // Update local state without reloading
      setFlashcards(prev => prev.map(card => 
        card.id === currentCard.id 
          ? { ...card, difficulty, study_count: card.study_count + 1 }
          : card
      ));
      
      // Move to next card
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
      } else {
        setStudyComplete(true);
      }
    } catch (err) {
      setError('Failed to update difficulty');
      console.error(err);
    }
  }, [currentCard, currentIndex, flashcards.length]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleSkip = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handleRestart = () => {
    loadFlashcards();
    setStudyComplete(false);
  };

  if (studyComplete || flashcards.length === 0) {
    return (
      <Layout flashcardsCount={flashcards.length} title="Study Mode">
        <div className="study-page" data-testid="study-page">
          <div className="study-complete">
            <div className="complete-icon">🎉</div>
            <h2>Study Session Complete!</h2>
            <p>
              {flashcards.length === 0
                ? 'No flashcards available to study.'
                : `You've reviewed all ${flashcards.length} flashcards.`}
            </p>
            <div className="complete-actions">
              <button onClick={handleRestart} className="btn btn-primary">
                Start New Session
              </button>
              <button onClick={() => navigateTo('home')} className="btn btn-secondary">
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout flashcardsCount={flashcards.length} title="Study Mode">
      <div className="study-page" data-testid="study-page">
        {loading ? (
          <div className="loading-container">
            <Loading message="Loading study session..." fullScreen={false} />
          </div>
        ) : (
          <>
            <div className="study-progress">
              <div className="progress-text">
                Card {currentIndex + 1} of {flashcards.length}
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

                {error && (
          <div className="error-banner" role="alert">
            {error}
            <button onClick={() => setError(null)} className="close-error">
              ×
            </button>
          </div>
        )}

        <div className="study-container">
          <div
            className={`study-card ${isFlipped ? 'flipped' : ''}`}
            onClick={handleFlip}
            data-testid="study-card"
          >
            <div className="study-card-inner">
              <div className="study-card-front">
                <div className="card-label">Question</div>
                <div className="card-content">{currentCard.front}</div>
                <div className="card-hint">Click to reveal answer</div>
              </div>

              <div className="study-card-back">
                <div className="card-label">Answer</div>
                <div className="card-content">{currentCard.back}</div>
                <div className="card-hint">Click to flip back</div>
              </div>
            </div>
          </div>

          {isFlipped && (
            <div className="difficulty-buttons" data-testid="difficulty-buttons">
              <p className="difficulty-prompt">How well did you know this?</p>
              <div className="difficulty-grid">
                <button
                  onClick={() => handleDifficulty('easy')}
                  className="btn-difficulty btn-easy"
                  data-testid="btn-easy"
                >
                  <span className="difficulty-icon">😊</span>
                  <span className="difficulty-label">Easy</span>
                  <span className="difficulty-desc">I knew it well</span>
                </button>

                <button
                  onClick={() => handleDifficulty('medium')}
                  className="btn-difficulty btn-medium"
                  data-testid="btn-medium"
                >
                  <span className="difficulty-icon">🤔</span>
                  <span className="difficulty-label">Medium</span>
                  <span className="difficulty-desc">Took some thought</span>
                </button>

                <button
                  onClick={() => handleDifficulty('hard')}
                  className="btn-difficulty btn-hard"
                  data-testid="btn-hard"
                >
                  <span className="difficulty-icon">😰</span>
                  <span className="difficulty-label">Hard</span>
                  <span className="difficulty-desc">Need more practice</span>
                </button>
              </div>
            </div>
          )}

          <div className="study-navigation">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="btn btn-nav"
              data-testid="btn-previous"
            >
              ← Previous
            </button>

            <button
              onClick={handleSkip}
              disabled={currentIndex === flashcards.length - 1}
              className="btn btn-nav"
              data-testid="btn-skip"
            >
              Skip →
            </button>
          </div>

          <div className="study-info">
            <span className={`difficulty-badge badge-${currentCard.difficulty}`}>
              {currentCard.difficulty.replace('_', ' ')}
            </span>
            <span className="study-count">{currentCard.study_count}x studied</span>
          </div>
        </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Study;
