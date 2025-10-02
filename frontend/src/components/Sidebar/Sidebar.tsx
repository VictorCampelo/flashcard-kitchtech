import React from 'react';
import { useApp, ViewType } from '../../contexts/AppContext';
import './Sidebar.css';

interface NavItem {
  icon: string;
  label: string;
  view: ViewType;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView?: ViewType;
  flashcardsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentView = 'home',
  flashcardsCount = 0,
}) => {
  const { navigateTo } = useApp();

  const mainNavItems: NavItem[] = [
    { icon: '🏠', label: 'Home', view: 'home' },
    { icon: '📚', label: 'Study Mode', view: 'study' },
    { icon: '📊', label: 'Kanban Board', view: 'kanban' },
  ];

  const handleNavClick = (view: ViewType) => {
    navigateTo(view);
    onClose();
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        data-testid="sidebar-overlay"
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} data-testid="sidebar">
        <div className="sidebar-header">
          <button onClick={() => handleNavClick('home')} className="sidebar-logo">
            <span className="sidebar-logo-icon">🎴</span>
            <h1 className="sidebar-logo-text">Flashcard App</h1>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-section">
            <h2 className="sidebar-nav-title">Navigation</h2>
            <ul className="sidebar-nav-list">
              {mainNavItems.map((item) => (
                <li key={item.view} className="sidebar-nav-item">
                  <button
                    className={`sidebar-nav-link ${
                      currentView === item.view ? 'active' : ''
                    }`}
                    onClick={() => handleNavClick(item.view)}
                    data-testid={`nav-link-${item.view}`}
                  >
                    <span className="sidebar-nav-icon">{item.icon}</span>
                    <span className="sidebar-nav-text">{item.label}</span>
                    {item.view === 'home' && flashcardsCount > 0 && (
                      <span className="sidebar-nav-badge" data-testid="flashcards-count">
                        {flashcardsCount}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-content">
            <p className="sidebar-footer-text">
              Made by <span className="sidebar-footer-author">Victor Campelo</span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
