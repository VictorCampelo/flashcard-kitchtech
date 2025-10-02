import { ErrorBoundary } from './components';
import { Home, Study, Kanban } from './pages';
import { AppProvider, useApp } from './contexts/AppContext';
import './App.css';

/**
 * Main App Component
 * Single page application with view switching
 */
const AppContent = () => {
  const { currentView } = useApp();

  return (
    <div className="app">
      <div style={{ display: currentView === 'home' ? 'block' : 'none' }}>
        <Home />
      </div>
      <div style={{ display: currentView === 'study' ? 'block' : 'none' }}>
        <Study />
      </div>
      <div style={{ display: currentView === 'kanban' ? 'block' : 'none' }}>
        <Kanban />
      </div>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
