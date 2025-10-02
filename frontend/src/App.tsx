import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components';
import { Home, Study, Kanban } from './pages';
import './App.css';

/**
 * Main App Component
 * Wrapped with ErrorBoundary for global error handling
 */
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/study" element={<Study />} />
            <Route path="/kanban" element={<Kanban />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
