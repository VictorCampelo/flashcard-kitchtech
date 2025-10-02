import React, { useEffect, useCallback } from 'react';
import {
  FlashcardCard,
  FlashcardForm,
  Loading,
  EmptyState,
  Modal,
  Layout,
} from '../../components';
import { useFlashcards, useToggle } from '../../hooks';
import { useApp } from '../../contexts/AppContext';
import { EMPTY_STATE, ERROR_MESSAGES } from '../../constants';
import type { Flashcard, CreateFlashcardDTO } from '../../types/flashcard';
import './Home.css';

/**
 * Home Page Component
 * Main page with CRUD operations for flashcards
 */
export const Home: React.FC = () => {
  const {
    flashcards,
    loading,
    error,
    loadFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    clearError,
  } = useFlashcards();

  const [showForm, , setShowForm] = useToggle(false);
  const [editingFlashcard, setEditingFlashcard] = React.useState<Flashcard | null>(null);

  const { currentView } = useApp();

  useEffect(() => {
    if (currentView === 'home') {
      loadFlashcards();
    }
  }, [currentView, loadFlashcards]);

  const handleCreate = useCallback(async (data: CreateFlashcardDTO) => {
    try {
      await createFlashcard(data);
      setShowForm(false);
    } catch (err) {
      throw new Error(ERROR_MESSAGES.CREATE_FAILED);
    }
  }, [createFlashcard, setShowForm]);

  const handleUpdate = useCallback(async (data: CreateFlashcardDTO) => {
    if (!editingFlashcard) return;

    try {
      await updateFlashcard(editingFlashcard.id, data);
      setEditingFlashcard(null);
    } catch (err) {
      throw new Error(ERROR_MESSAGES.UPDATE_FAILED);
    }
  }, [editingFlashcard, updateFlashcard]);

  const handleDelete = useCallback(async (id: number) => {
    await deleteFlashcard(id);
  }, [deleteFlashcard]);

  const handleEdit = useCallback((flashcard: Flashcard) => {
    setEditingFlashcard(flashcard);
    setShowForm(false);
  }, [setShowForm]);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingFlashcard(null);
  }, [setShowForm]);

  const handleNewFlashcard = useCallback(() => {
    setEditingFlashcard(null);
    setShowForm(true);
  }, [setShowForm]);

  return (
    <Layout
      flashcardsCount={flashcards.length}
      onNewFlashcard={handleNewFlashcard}
      title="Flashcard App"
    >
      <div className="home-page" data-testid="home-page">
        <header className="page-header">
          <h1>🎴 Aloo App</h1>
          <p>Master your knowledge with spaced repetition</p>
        </header>

        <div className="actions-bar">
          <button
            onClick={handleNewFlashcard}
            className="btn btn-new"
            data-testid="new-flashcard-button"
          >
            + New Flashcard
          </button>
          <button
            onClick={loadFlashcards}
            className="btn btn-refresh"
            data-testid="refresh-button"
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>

        {error && (
          <div className="error-banner" role="alert">
            {error}
            <button onClick={clearError} className="close-error">
              ×
            </button>
          </div>
        )}

        <Modal
          isOpen={showForm || !!editingFlashcard}
          onClose={handleCancelForm}
          title={editingFlashcard ? 'Edit Flashcard' : 'Create New Flashcard'}
        >
          <FlashcardForm
            flashcard={editingFlashcard || undefined}
            onSubmit={editingFlashcard ? handleUpdate : handleCreate}
            onCancel={handleCancelForm}
          />
        </Modal>

        <div className="home-content">
          {loading ? (
            <Loading message="Loading flashcards..." fullScreen={false} />
          ) : flashcards.length === 0 ? (
            <EmptyState
              title={EMPTY_STATE.TITLE}
              description={EMPTY_STATE.DESCRIPTION}
              icon={EMPTY_STATE.ICON}
              actionLabel={EMPTY_STATE.ACTION_LABEL}
              onAction={handleNewFlashcard}
            />
          ) : (
            <div className="flashcards-grid" data-testid="flashcards-grid">
              {flashcards.map((flashcard) => (
                <FlashcardCard
                  key={flashcard.id}
                  flashcard={flashcard}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
