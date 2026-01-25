import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './webpage/App.jsx';

// Suppress 401 errors from Firebase Cloud Functions during initial load
// These are expected when functions aren't deployed or auth isn't ready
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args[0]?.toString() || '';
  const is401Error = 
    message.includes('401') ||
    message.includes('Unauthorized') ||
    (args[0]?.code && (
      args[0].code === 'functions/unauthenticated' ||
      args[0].code === 'unauthenticated'
    )) ||
    (args[0]?.message && (
      args[0].message.includes('401') ||
      args[0].message.includes('Unauthorized')
    ));
  
  
  // Log all other errors normally
  originalConsoleError.apply(console, args);
};

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);