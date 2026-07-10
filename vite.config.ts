import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@admin': path.resolve(__dirname, './src/admin'),
        '@customer': path.resolve(__dirname, './src/customer'),
        '@features': path.resolve(__dirname, './src/features'),
        '@routes': path.resolve(__dirname, './src/routes'),
        '@layouts': path.resolve(__dirname, './src/layouts'),
        '@api': path.resolve(__dirname, './src/api'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              // Delete Origin header to bypass Kong CORS completely,
              // or set it to an allowed origin
              proxyReq.setHeader('Origin', 'http://localhost:3000');
            });
          },
        },
      },
    },
    build: {
      // Increase chunk size warning threshold (some pages are legitimately large)
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          // Split vendor libs into a separate chunk
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            zustand: ['zustand'],
            axios: ['axios'],
          },
        },
      },
    },
  };
});
