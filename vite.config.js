import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import { liveEdit } from './src/plugins/live-edit/index.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    imagetools(),
    cssInjectedByJsPlugin(),
    ...(mode === 'development' ? [liveEdit()] : []),
  ],
  build: {
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        // Rolldown (Vite 8) requires a function form for manualChunks
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) {
            return 'react-vendor'
          }
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) {
            return 'motion'
          }
          if (id.includes('/lenis/')) return 'lenis'
          return undefined
        },
      },
    },
  },
}))
