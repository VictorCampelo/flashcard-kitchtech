import React from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Empty State Component
 * Displays when no data is available
 */
export const EmptyState: React.FC<EmptyStateProps> = React.memo(({
  title,
  description,
  icon = '📭',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="empty-state" data-testid="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h2 className="empty-state-title">{title}</h2>
      <p className="empty-state-description">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary-large">
          {actionLabel}
        </button>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;
