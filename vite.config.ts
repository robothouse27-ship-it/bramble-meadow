import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// In production the app is served from GitHub Pages under /bramble-meadow/;
// local dev stays at the root.
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/bramble-meadow/' : '/',
  plugins: [react()],
}))
