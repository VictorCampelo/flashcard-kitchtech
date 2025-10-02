import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components';
import { Home } from './pages';
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
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
