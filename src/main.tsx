import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ScoreProvider } from './context/ScoreContext';
import App from './UI/App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ScoreProvider>
        <App />
      </ScoreProvider>
    </BrowserRouter>
  </StrictMode>,
);
