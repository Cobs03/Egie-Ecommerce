import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 5000,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://mhhnfftaoihhltbknenq.supabase.co https://api.groq.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.supabase.co https://i.ibb.co blob:; font-src 'self' data:; connect-src 'self' http://localhost:5000 https://mhhnfftaoihhltbknenq.supabase.co https://api.groq.com https://api.sketchfab.com https://sketchfab-prod-media.s3.amazonaws.com wss://mhhnfftaoihhltbknenq.supabase.co; frame-ancestors 'none';"
    }
  }
})
