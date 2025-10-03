// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    entries: ["src/main.jsx"],
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "firebase/app",
      "firebase/auth",
      "firebase/firestore",
    ],
    force: true, // forza rigenerazione pre-bundle per evitare "Outdated Optimize Dep"
  },
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "src/app"),
      "@features": path.resolve(__dirname, "src/features"),
      "@ui": path.resolve(__dirname, "src/components/ui"),
      "@lib": path.resolve(__dirname, "src/lib"),
      "@data": path.resolve(__dirname, "src/data"),
      "@services": path.resolve(__dirname, "src/services"),
      "@contexts": path.resolve(__dirname, "src/contexts"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@layouts": path.resolve(__dirname, "src/layouts"),
      "@components": path.resolve(__dirname, "src/components"),
      "@utils": path.resolve(__dirname, "src/utils"),
      // (opzionale) se vuoi anche lo stile "@/qualcosa"
      // '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true, // se la 5173 è occupata fallisce invece di cambiare porta (evita mismatch HMR)
    headers: {
      "Cross-Origin-Opener-Policy": "unsafe-none",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
    cors: {
      origin: [
        "http://localhost:5173",
        "https://*.firebaseapp.com",
        "https://*.googleapis.com",
      ],
      credentials: true,
    },
    // Allineiamo HMR alla stessa porta per evitare tentativi di connessione WS su 5174
    hmr: {
      host: "localhost",
      protocol: "ws",
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
          const ext = assetInfo.name.split(".").at(1);
          const timestamp = Date.now().toString(36);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/[name]-${timestamp}-[hash][extname]`;
          }
          return `assets/[name]-${timestamp}-[hash][extname]`;
        },
        chunkFileNames: `assets/[name]-${Date.now().toString(36)}-[hash].js`,
        entryFileNames: `assets/[name]-${Date.now().toString(36)}-[hash].js`,
        manualChunks: (id) => {
          // Core vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('firebase')) {
              return 'firebase';
            }
            if (id.includes('recharts') || id.includes('chart')) {
              return 'charts';
            }
            if (id.includes('lucide-react') || id.includes('icon')) {
              return 'icons';
            }
            // Other vendor libraries
            return 'libs';
          }
          
          // Application chunks
          if (id.includes('/features/admin/')) {
            return 'admin';
          }
          if (id.includes('/features/clubs/')) {
            return 'clubs';
          }
          if (id.includes('/features/booking/') || id.includes('/features/prenota/')) {
            return 'booking';
          }
          if (id.includes('/features/players/') || id.includes('/features/matches/')) {
            return 'players-matches';
          }
          if (id.includes('/components/ui/')) {
            return 'ui-components';
          }
          if (id.includes('/lib/') || id.includes('/utils/')) {
            return 'utilities';
          }
        },
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
});
