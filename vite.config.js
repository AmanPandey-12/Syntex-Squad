import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.openweathermap\.org\/.*$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'weather-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 30 }
            }
          },
          {
            urlPattern: /^https:\/\/api\.data\.gov\.in\/.*$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'mandi-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 4 }
            }
          },
          {
            urlPattern: /^https:\/\/openrouter\.ai\/.*$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'ai-cache',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 10
            }
          }
        ]
      },
      manifest: {
        name: 'KrishiAI - Smart Farming Assistant',
        short_name: 'KrishiAI',
        description: 'AI-powered farming assistant for Indian farmers — disease detection, mandi prices, weather alerts',
        theme_color: '#2e7d4f',
        background_color: '#f0f4ed',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/dashboard',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        categories: ['agriculture', 'productivity', 'lifestyle'],
        lang: 'hi-IN',
        shortcuts: [
          {
            name: 'Disease Scanner',
            short_name: 'Scanner',
            description: 'Fasal ki bimari detect karein',
            url: '/detection',
            icons: [{ src: 'favicon.svg', sizes: 'any' }]
          },
          {
            name: 'Mandi Prices',
            short_name: 'Mandi',
            description: 'Live mandi bhav dekhein',
            url: '/dashboard',
            icons: [{ src: 'favicon.svg', sizes: 'any' }]
          },
          {
            name: 'Crop Picker',
            short_name: 'Fasal',
            description: 'Best fasal chunein',
            url: '/crop-picker',
            icons: [{ src: 'favicon.svg', sizes: 'any' }]
          }
        ]
      }
    })
  ]
})
