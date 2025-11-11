// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve';

  return {
    plugins: [react()],
    optimizeDeps: {
      entries: ['src/main.jsx'],
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        '@capacitor/core',
        '@capacitor/push-notifications',
        '@capacitor/device',
      ],
      // Avoid forcing re-optimization on every restart in dev (can cause churn/crashes)
      force: false,
      // Prevent React duplicate instances during HMR
      esbuildOptions: {
        target: 'esnext',
        supported: {
          'top-level-await': true
        },
      },
    },
    resolve: {
      dedupe: [
        'react',
        'react-dom',
        'react-router-dom',
        // Ensure single firebase instance to avoid Firestore type mismatches
        'firebase',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'firebase/storage',
      ],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@app': path.resolve(__dirname, 'src/app'),
        '@features': path.resolve(__dirname, 'src/features'),
        '@ui': path.resolve(__dirname, 'src/components/ui'),
        '@lib': path.resolve(__dirname, 'src/lib'),
        '@data': path.resolve(__dirname, 'src/data'),
        '@services': path.resolve(__dirname, 'src/services'),
        // Some modules expect "@config/firebase" to resolve to our firebase service
        '@config': path.resolve(__dirname, 'src/services'),
        '@contexts': path.resolve(__dirname, 'src/contexts'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@layouts': path.resolve(__dirname, 'src/layouts'),
        '@components': path.resolve(__dirname, 'src/components'),
      },
    },
    server: {
      port: 5173,
      host: true,
      // Allow port fallback in dev to avoid exit(1) when 5173 is busy
      strictPort: false,
      // Keep minimal headers; remove CSP in dev to avoid conflicts
      headers: {
        'Cross-Origin-Opener-Policy': 'unsafe-none',
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
      },
      cors: {
        origin: ['http://localhost:5173'],
        credentials: true,
      },
      // Use defaults for HMR; explicit host/protocol sometimes causes reconnect issues on Windows
      hmr: {
        overlay: true,
      },
      watch: {
        usePolling: true,
      },
    },
    css: {
      devSourcemap: true,
    },
    build: {
      target: 'esnext',
      minify: 'terser',
      sourcemap: false,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          // Force new hash generation with timestamp
          assetFileNames: (assetInfo) => {
            const ext = assetInfo.name.split('.').at(1);
            const timestamp = Date.now().toString(36);
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/[name]-${timestamp}-[hash][extname]`;
            }
            return `assets/[name]-${timestamp}-[hash][extname]`;
          },
          chunkFileNames: `assets/[name]-${Date.now().toString(36)}-[hash].js`,
          entryFileNames: `assets/[name]-${Date.now().toString(36)}-[hash].js`,
          // Let Vite handle chunking automatically
        },
      },
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
        },
        mangle: {
          safari10: true,
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  };
});
