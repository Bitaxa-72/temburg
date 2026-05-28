import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/context/AuthContext';
import { BookingProvider } from '@/context/BookingContext';
import App from './App';
import './index.css';

const chunkReloadKey = `termburg:chunk-reload:${window.location.pathname}`;
const chunkReloadCooldownMs = 5 * 60 * 1000;

function getErrorMessage(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value instanceof Error) return value.message;
  if (value && typeof value === 'object' && 'message' in value) {
    return String((value as { message: unknown }).message);
  }

  return '';
}

function isChunkLoadError(value: unknown): boolean {
  const message = getErrorMessage(value);

  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('error loading dynamically imported module') ||
    message.includes('Unable to preload CSS')
  );
}

function reloadFreshBuildOnce(): void {
  const lastReload = Number(window.sessionStorage.getItem(chunkReloadKey) || 0);

  if (Date.now() - lastReload < chunkReloadCooldownMs) {
    return;
  }

  window.sessionStorage.setItem(chunkReloadKey, String(Date.now()));
  window.location.reload();
}

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  reloadFreshBuildOnce();
});

window.addEventListener('unhandledrejection', (event) => {
  if (isChunkLoadError(event.reason)) {
    event.preventDefault();
    reloadFreshBuildOnce();
  }
});

window.addEventListener('error', (event) => {
  if (isChunkLoadError(event.error) || isChunkLoadError(event.message)) {
    event.preventDefault();
    reloadFreshBuildOnce();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <BookingProvider>
            <App />
          </BookingProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
