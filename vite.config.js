import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '::', // Listen on all addresses (IPv4 and IPv6)
    open: true  // Auto-open browser
  },
  preview: {
    port: 4173,
    host: true
  }
})
