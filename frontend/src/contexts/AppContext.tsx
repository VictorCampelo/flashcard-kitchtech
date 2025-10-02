import React, { createContext, useContext, useState, useCallback } from 'react';

export type ViewType = 'home' | 'study' | 'kanban';

interface AppContextType {
  currentView: ViewType;
  navigateTo: (view: ViewType) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewType>('home');

  const navigateTo = useCallback((view: ViewType) => {
    setCurrentView(view);
  }, []);

  return (
    <AppContext.Provider value={{ currentView, navigateTo }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
