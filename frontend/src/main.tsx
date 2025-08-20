import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Environment check
if (import.meta.env.DEV) {
  console.log('🚀 Online Quotation Tool - Development Mode');
  console.log('Environment:', import.meta.env.MODE);
  console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
}

// Error boundary for development
if (import.meta.env.DEV) {
  const originalError = console.error;
  console.error = (...args) => {
    if (args[0]?.includes('Warning: ReactDOM.render is no longer supported')) {
      return;
    }
    originalError.call(console, ...args);
  };
}

// Create root and render app
const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}
