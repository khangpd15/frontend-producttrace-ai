import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Log environment variables during startup to verify configuration loaded by Vercel
console.log('--- System Startup Environment Verification ---');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('NEXT_PUBLIC_API_URL:', import.meta.env.NEXT_PUBLIC_API_URL);
console.log('REACT_APP_API_URL:', import.meta.env.REACT_APP_API_URL);
console.log('------------------------------------------------');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
