import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeProvider';
import { safeGetItem } from './utils/storage';

const rootElement = document.getElementById('root');

document.documentElement.dataset.theme = safeGetItem('fortress_theme') === 'dark' ? 'dark' : 'light';

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ThemeProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </ThemeProvider>
    </StrictMode>
  );
}
