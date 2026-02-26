import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: '/masters-pool/', // NECESSARY FOR GITHUB PAGES (doesnt work with browser router tho :( )
  base: '/',
});
