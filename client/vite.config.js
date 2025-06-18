import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({  plugins: [
    react({
      // React 19 optimizations
      fastRefresh: true,
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      // Enable React 19 compiler optimizations
      babel: {
        plugins: []
      }
    })
  ],
  // Optimize dependencies for faster cold starts
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios'
    ],
    exclude: ['fsevents'],
    force: false // Set to true only if you want to force re-optimization
  },

  // Development server configuration
  server: {
    port: 3001,
    host: true, // Listen on all addresses
    open: false, // Don't auto-open browser (faster startup)
    cors: true,
    // Enable HMR for faster updates
    hmr: {
      overlay: true
    },
    // Proxy API calls to backend
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket proxying
      }
    }
  },

  // Build optimizations
  build: {
    // Use esbuild for faster builds
    target: 'esnext',
    minify: 'esbuild',
    // Enable source maps for debugging
    sourcemap: true,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          mantine: ['@mantine/core', '@mantine/hooks', '@mantine/form'],
          router: ['react-router-dom'],
          charts: ['recharts'],
          icons: ['@tabler/icons-react', 'react-icons'],
          motion: ['framer-motion']
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000
  },

  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@api': path.resolve(__dirname, './src/api'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@context': path.resolve(__dirname, './src/context'),
      '@layout': path.resolve(__dirname, './src/layout')
    },
  },

  // Enable CSS optimizations
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  // Enable experimental features for better performance
  esbuild: {
    target: 'esnext',
    platform: 'browser',
    format: 'esm',
    jsx: 'automatic'
  },

  // Vitest configuration for React 19
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: true,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']
  },
  // Cache directory
  cacheDir: 'node_modules/.vite'
});