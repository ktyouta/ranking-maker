/// <reference types="vitest/config" />
/// <reference types="vite/client" />

import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // main.tsx側で virtual:pwa-register を呼び出すため、自動登録スクリプトの注入は行わない
      injectRegister: null,
      // API通信はキャッシュ対象に含めない（静的アセットのみプリキャッシュ）
      workbox: {
        navigateFallbackDenylist: [/^\/api\//],
      },
      manifest: {
        name: 'RankingMaker',
        short_name: 'RankingMaker',
        description: 'ランキング作成アプリ',
        start_url: '/',
        display: 'standalone',
        background_color: '#18181b',
        theme_color: '#7C6FE0',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@backend': path.resolve(__dirname, '../backend/src'),
    },
  },
  server: {
    // ブラウザを自動で開く
    open: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/testing/setup-tests.ts',
    projects: [{
      extends: true,
      plugins: [],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          instances: [{
            browser: 'chromium'
          }]
        },
        setupFiles: ['.storybook/vitest.setup.ts']
      }
    }]
  },
  css: {
    postcss: './postcss.config.js',
  },
});