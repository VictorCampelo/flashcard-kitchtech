import React, { useEffect, useCallback } from "react";
import {
  FlashcardCard,
  FlashcardForm,
  Loading,
  EmptyState,
  ConfirmModal,
  Layout,
} from "../../components";
import { CreateFlashcardModal as Modal } from "../../components/Modals/CreateFlashcardModal/CreateFlashcardModal";
import { EMPTY_STATE, ERROR_MESSAGES } from "../../constants";
import type { Flashcard, CreateFlashcardDTO } from "../../types/flashcard";
import "./Home.css";
import { useFlashcards, useToggle } from "../../hooks";

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
  const [editingFlashcard, setEditingFlashcard] =
    React.useState<Flashcard | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<{
    show: boolean;
    flashcardId: number | null;
  }>({ show: false, flashcardId: null });

  useEffect(() => {
    loadFlashcards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = useCallback(
    async (data: CreateFlashcardDTO) => {
      try {
        await createFlashcard(data);
        setShowForm(false);
      } catch (err) {
        throw new Error(ERROR_MESSAGES.CREATE_FAILED);
      }
    },
    [createFlashcard, setShowForm]
  );

  const handleUpdate = useCallback(
    async (data: CreateFlashcardDTO) => {
      if (!editingFlashcard) return;

      try {
        await updateFlashcard(editingFlashcard.id, data);
        setEditingFlashcard(null);
      } catch (err) {
        throw new Error(ERROR_MESSAGES.UPDATE_FAILED);
      }
    },
    [editingFlashcard, updateFlashcard]
  );

  const handleDelete = useCallback(
    (id: number) => {
      setDeleteConfirm({ show: true, flashcardId: id });
    },
    []
  );

  const confirmDelete = useCallback(async () => {
    const idToDelete = deleteConfirm.flashcardId;
    console.log('[HOME] confirmDelete called for ID:', idToDelete);
    
    // Close modal first
    setDeleteConfirm({ show: false, flashcardId: null });
    
    // Then execute delete
    if (idToDelete) {
      console.log('[HOME] Calling deleteFlashcard for ID:', idToDelete);
      await deleteFlashcard(idToDelete);
      console.log('[HOME] Delete completed');
    }
  }, [deleteConfirm.flashcardId, deleteFlashcard]);

  const cancelDelete = useCallback(() => {
    setDeleteConfirm({ show: false, flashcardId: null });
  }, []);

  const handleEdit = useCallback(
    (flashcard: Flashcard) => {
      setEditingFlashcard(flashcard);
      setShowForm(false);
    },
    [setShowForm]
  );

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
          <h1>🎴 Flashcard App</h1>
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
          title={editingFlashcard ? "Edit Flashcard" : "Create New Flashcard"}
        >
          <FlashcardForm
            flashcard={editingFlashcard || undefined}
            onSubmit={editingFlashcard ? handleUpdate : handleCreate}
            onCancel={handleCancelForm}
          />
        </Modal>

        <ConfirmModal
          isOpen={deleteConfirm.show}
          title="Delete Flashcard"
          message="Are you sure you want to delete this flashcard? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />

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
