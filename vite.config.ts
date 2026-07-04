import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
// In production the app is served from GitHub Pages under /bramble-meadow/;
// local dev stays at the root.
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/bramble-meadow/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Bramble Meadow',
        short_name: 'Bramble',
        description: 'A cozy woodland Sudoku, with Pip the hedgehog by your side.',
        theme_color: '#f2a740',
        background_color: '#fef3d9',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // the meadow & poster art are large; precache them so the game works
        // fully offline once installed
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,png,svg,woff,woff2}'],
      },
    }),
  ],
}))
