import React from 'react';
import { useApp, ViewType } from '../../contexts/AppContext';
import './BottomBar.css';

interface NavItem {
  icon: string;
  label: string;
  view: ViewType;
}

interface BottomBarProps {
  currentView?: ViewType;
  flashcardsCount?: number;
  onNewFlashcard?: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  currentView = 'home',
  flashcardsCount = 0,
  onNewFlashcard,
}) => {
  const { navigateTo } = useApp();

  const navItems: NavItem[] = [
    { icon: '🏠', label: 'Home', view: 'home' },
    { icon: '📚', label: 'Study', view: 'study' },
    { icon: '📊', label: 'Kanban', view: 'kanban' },
  ];

  return (
    <nav className="bottom-bar" data-testid="bottom-bar">
      <div className="bottom-bar-nav">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => navigateTo(item.view)}
            className={`bottom-bar-item ${currentView === item.view ? 'active' : ''}`}
            data-testid={`bottom-nav-${item.view}`}
          >
            <span className="bottom-bar-icon">
              {item.icon}
              {item.view === 'home' && flashcardsCount > 0 && (
                <span className="bottom-bar-badge" data-testid="bottom-flashcards-count">
                  {flashcardsCount}
                </span>
              )}
            </span>
            <span className="bottom-bar-label">{item.label}</span>
          </button>
        ))}
        <button
          className="bottom-bar-item"
          onClick={onNewFlashcard}
          data-testid="bottom-new-flashcard"
        >
          <span className="bottom-bar-icon">➕</span>
          <span className="bottom-bar-label">New</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomBar;
