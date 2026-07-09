import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Timeline } from './pages/Timeline';
import { MapView } from './pages/MapView';
import { Quiz } from './pages/Quiz';
import { AdminPanel } from './pages/AdminPanel';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="relative min-h-screen bg-rasala-dark">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
          <Navbar />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
