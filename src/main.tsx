import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ScoreProvider } from './context/ScoreContext';
import { ThemeProvider } from './context/ThemeContext';
import App from './UI/App.tsx';
import { ErrorBoundary } from './UI/components/errorView/ErrorBoundary.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <ScoreProvider>
            <App />
          </ScoreProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
