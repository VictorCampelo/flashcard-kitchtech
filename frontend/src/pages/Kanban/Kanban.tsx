import React, { useState, useEffect, useCallback } from 'react';
import { FlashcardService } from '../../services/flashcardService';
import { Loading, Layout } from '../../components';
import { useApp } from '../../contexts/AppContext';
import type { Flashcard, DifficultyLevel, StudyStats } from '../../types/flashcard';
import './Kanban.css';

interface KanbanColumn {
  id: DifficultyLevel;
  title: string;
  icon: string;
  color: string;
}

const COLUMNS: KanbanColumn[] = [
  { id: 'not_studied', title: 'Not Studied', icon: '📝', color: '#6b7280' },
  { id: 'hard', title: 'Hard', icon: '😰', color: '#ef4444' },
  { id: 'medium', title: 'Medium', icon: '🤔', color: '#f59e0b' },
  { id: 'easy', title: 'Easy', icon: '😊', color: '#22c55e' },
];

/**
 * Kanban Board Page
 * Displays flashcards organized by difficulty level
 */
export const Kanban: React.FC = () => {
  const { navigateTo, currentView } = useApp();
  const [flashcardsByDifficulty, setFlashcardsByDifficulty] = useState<
    Record<DifficultyLevel, Flashcard[]>
  >({
    not_studied: [],
    easy: [],
    medium: [],
    hard: [],
  });
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentView === 'kanban') {
      loadData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all flashcards and stats in parallel
      const [allCards, statsData] = await Promise.all([
        FlashcardService.getAll(),
        FlashcardService.getStats(),
      ]);

      // Group flashcards by difficulty
      const grouped: Record<DifficultyLevel, Flashcard[]> = {
        not_studied: [],
        easy: [],
        medium: [],
        hard: [],
      };

      allCards.forEach((card) => {
        grouped[card.difficulty].push(card);
      });

      setFlashcardsByDifficulty(grouped);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load kanban data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDifficultyChange = useCallback(async (cardId: number, newDifficulty: DifficultyLevel) => {
    try {
      await FlashcardService.updateDifficulty(cardId, newDifficulty);
      
      // Update local state without reloading
      setFlashcardsByDifficulty(prev => {
        const updated = { ...prev };
        let movedCard: Flashcard | null = null;
        
        // Find and remove card from old difficulty
        Object.keys(updated).forEach(key => {
          const difficulty = key as DifficultyLevel;
          const index = updated[difficulty].findIndex(c => c.id === cardId);
          if (index !== -1) {
            movedCard = { ...updated[difficulty][index], difficulty: newDifficulty };
            updated[difficulty] = updated[difficulty].filter(c => c.id !== cardId);
          }
        });
        
        // Add card to new difficulty
        if (movedCard) {
          updated[newDifficulty] = [...updated[newDifficulty], movedCard];
        }
        
        return updated;
      });
    } catch (err) {
      setError('Failed to update difficulty');
      console.error(err);
    }
  }, []);

  const totalCards = stats?.total || 0;

  return (
    <Layout flashcardsCount={totalCards} title="Kanban Board">
      <div className="kanban-page" data-testid="kanban-page">
        {loading ? (
          <div className="loading-container">
            <Loading message="Loading kanban board..." fullScreen={false} />
          </div>
        ) : (
          <>
            <header className="kanban-header">
              <h1>📊 Study Progress Board</h1>
              <p>Track your flashcard mastery</p>
            </header>

        {error && (
          <div className="error-banner" role="alert">
            {error}
            <button onClick={() => setError(null)} className="close-error">
              ×
            </button>
          </div>
        )}

        {stats && (
          <div className="stats-overview">
            <div className="stat-card">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Cards</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.total_studies}</div>
              <div className="stat-label">Total Studies</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.avg_studies_per_card}</div>
              <div className="stat-label">Avg per Card</div>
            </div>
            <div className="stat-card stat-progress">
              <div className="stat-value">
                {stats.total > 0
                  ? Math.round(((stats.easy + stats.medium) / stats.total) * 100)
                  : 0}
                %
              </div>
              <div className="stat-label">Mastery</div>
            </div>
          </div>
        )}

        <div className="kanban-board">
          {COLUMNS.map((column) => (
            <div key={column.id} className="kanban-column" data-testid={`column-${column.id}`}>
              <div className="column-header" style={{ borderTopColor: column.color }}>
                <span className="column-icon">{column.icon}</span>
                <h3 className="column-title">{column.title}</h3>
                <span className="column-count">
                  {flashcardsByDifficulty[column.id].length}
                </span>
              </div>

              <div className="column-cards">
                {flashcardsByDifficulty[column.id].length === 0 ? (
                  <div className="empty-column">
                    <p>No cards here</p>
                  </div>
                ) : (
                  flashcardsByDifficulty[column.id].map((card) => (
                    <KanbanCard
                      key={card.id}
                      card={card}
                      onDifficultyChange={handleDifficultyChange}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        <footer className="kanban-footer">
          <button onClick={() => navigateTo('home')} className="btn btn-secondary">
            Back to Home
          </button>
          <button onClick={() => navigateTo('study')} className="btn btn-primary">
            Start Studying
          </button>
        </footer>
          </>
        )}
      </div>
    </Layout>
  );
};

interface KanbanCardProps {
  card: Flashcard;
  onDifficultyChange: (cardId: number, difficulty: DifficultyLevel) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = React.memo(({ card, onDifficultyChange }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleDifficultySelect = useCallback((difficulty: DifficultyLevel) => {
    onDifficultyChange(card.id, difficulty);
    setShowMenu(false);
  }, [card.id, onDifficultyChange]);

  const toggleMenu = useCallback(() => {
    setShowMenu(prev => !prev);
  }, []);

  return (
    <div className="kanban-card" data-testid="kanban-card">
      <div className="card-header">
        <span className="card-id">#{card.id}</span>
        <button
          className="card-menu-btn"
          onClick={toggleMenu}
          data-testid="card-menu-btn"
        >
          ⋮
        </button>
        {showMenu && (
          <div className="card-menu" data-testid="card-menu">
            <button onClick={() => handleDifficultySelect('not_studied')}>
              📝 Not Studied
            </button>
            <button onClick={() => handleDifficultySelect('easy')}>😊 Easy</button>
            <button onClick={() => handleDifficultySelect('medium')}>🤔 Medium</button>
            <button onClick={() => handleDifficultySelect('hard')}>😰 Hard</button>
          </div>
        )}
      </div>

      <div className="card-content">
        <div className="card-question">{card.front}</div>
      </div>

      <div className="card-footer">
        <span className="card-studies">
          📚 {card.study_count} {card.study_count === 1 ? 'study' : 'studies'}
        </span>
        {card.last_studied_at && (
          <span className="card-last-studied" title={card.last_studied_at}>
            🕐 {new Date(card.last_studied_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
});

KanbanCard.displayName = 'KanbanCard';

export default Kanban;
