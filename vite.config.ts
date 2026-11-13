import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Shown in the parent corner so it is easy to tell which version a device has.
const version = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

// Relative base so the build works on GitHub Pages (/learning-cards/) and locally.
export default defineConfig({
  base: './',
  define: { __APP_VERSION__: JSON.stringify(version) },
  plugins: [
    react(),
    // Installable app that works offline after the first visit. The service
    // worker keeps only the small app shell; the recorded voices are fetched
    // and kept by the app itself (src/voice/packs.ts), so one failed download
    // can never block an update. src/update.ts decides when to switch to a
    // new version.
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icons/favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Learning Cards',
        short_name: 'Learning Cards',
        description: 'Reading, numbers, thinking games and play for young children.',
        lang: 'en-GB',
        start_url: './',
        scope: './',
        display: 'fullscreen',
        display_override: ['fullscreen', 'standalone'],
        orientation: 'any',
        background_color: '#F6EFDF',
        theme_color: '#F6EFDF',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // woff files are skipped: every browser that can install the app uses woff2.
        globPatterns: ['**/*.{js,css,html,woff2,png,svg}', 'voice/silence.mp3'],
        cleanupOutdatedCaches: true,
        // One-time help for devices on an old version; see public/sw-legacy.js.
        importScripts: ['sw-legacy.js'],
        navigateFallback: 'index.html',
        // The design system's typography file also asks Google Fonts for its
        // fonts; keep a copy so that request works offline too.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
});
