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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Keep three.js separate
            if (id.includes('three')) {
              return 'three';
            }
            // Keep supabase separate
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            // Keep react core together
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-core';
            }
            // Keep UI libraries separate
            if (id.includes('@radix-ui')) {
              return 'ui-radix';
            }
            // Everything else
            return 'vendor';
          }
        }
      }
    }
  }
})
