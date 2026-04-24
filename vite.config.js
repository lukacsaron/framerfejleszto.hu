import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { liveEdit } from './src/plugins/live-edit/index.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), liveEdit()],
  server: {
    watch: {
      // Include framer/ directory (outside src/) in HMR watching
      ignored: ['!**/framer/**'],
    },
  },
})
