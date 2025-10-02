import React, { useState } from 'react';
import { useApp, ViewType } from '../../contexts/AppContext';
import { Sidebar } from '../Sidebar/Sidebar';
import { BottomBar } from '../BottomBar/BottomBar';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  flashcardsCount?: number;
  onNewFlashcard?: () => void;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  flashcardsCount = 0,
  onNewFlashcard,
  title,
}) => {
  const { currentView } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="layout" data-testid="layout">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        currentView={currentView}
        flashcardsCount={flashcardsCount}
      />

      <div className="layout-main">
        <header className="layout-header">
          <div className="layout-header-left">
            <button
              className="layout-menu-button"
              onClick={handleToggleSidebar}
              aria-label="Toggle menu"
              data-testid="menu-button"
            >
              ☰
            </button>
            {title && <h1 className="layout-header-title">{title}</h1>}
          </div>
        </header>

        <main className="layout-content" data-testid="layout-content">
          {children}
        </main>
      </div>

      <BottomBar
        currentView={currentView}
        flashcardsCount={flashcardsCount}
        onNewFlashcard={onNewFlashcard}
      />
    </div>
  );
};

export default Layout;
