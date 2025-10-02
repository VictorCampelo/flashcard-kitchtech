import React from 'react';
import './Loading.css';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

/**
 * Loading Component
 * Displays loading spinner with optional message
 */
export const Loading: React.FC<LoadingProps> = React.memo(({
  message = 'Loading...',
  size = 'medium',
  fullScreen = false,
}) => {
  const containerClass = fullScreen ? 'loading-container full-screen' : 'loading-container';

  return (
    <div className={containerClass} data-testid="loading">
      <div className={`spinner ${size}`} aria-label="Loading spinner" />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
});

Loading.displayName = 'Loading';

export default Loading;
