// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, 'src/app'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@ui': path.resolve(__dirname, 'src/components/ui'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@data': path.resolve(__dirname, 'src/data'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@contexts': path.resolve(__dirname, 'src/contexts'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@layouts': path.resolve(__dirname, 'src/layouts'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      // (opzionale) se vuoi anche lo stile "@/qualcosa"
      // '@': path.resolve(__dirname, 'src'),
    }
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Cross-Origin-Embedder-Policy': 'unsafe-none'
    },
    cors: {
      origin: ['http://localhost:5173', 'https://*.firebaseapp.com', 'https://*.googleapis.com'],
      credentials: true
    }
  },
  css: {
    devSourcemap: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          charts: ['recharts'],
        }
      }
    }
  }
})
