import React from 'react';
import './ConfirmModal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning',
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="confirm-modal-overlay"
      onClick={handleOverlayClick}
      data-testid="confirm-modal-overlay"
    >
      <div className={`confirm-modal-content ${variant}`} data-testid="confirm-modal">
        <div className="confirm-modal-header">
          <h3 className="confirm-modal-title">{title}</h3>
        </div>
        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>
        <div className="confirm-modal-actions">
          <button
            onClick={onCancel}
            className="btn btn-secondary"
            data-testid="confirm-cancel-button"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`btn btn-${variant === 'danger' ? 'danger' : 'primary'}`}
            data-testid="confirm-confirm-button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
