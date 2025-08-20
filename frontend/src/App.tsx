import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DemoLayout from '@/pages/DemoLayout';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/demo" replace />} />
          <Route path="/demo" element={<DemoLayout />} />
          <Route path="*" element={<Navigate to="/demo" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
