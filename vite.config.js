import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    watch: {
      // Optimize for cloud storage (OneDrive)
      usePolling: false,
      interval: 1000,
    },
    fs: {
      // Allow serving files from outside the project root
      strict: false,
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  optimizeDeps: {
    // Exclude problematic dependencies from pre-bundling
    exclude: [],
  },
  publicDir: 'public',
})
