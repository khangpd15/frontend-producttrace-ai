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
      port: 5173, // Frontend chạy ở 5173
      host: '0.0.0.0',
      proxy: {
        // --- 1. Luồng Golang (8080) ---
        // Chứa dữ liệu nghiệp vụ chính
        '/api/auth': { target: 'http://localhost:8080', changeOrigin: true, secure: false },
        '/api/users': { target: 'http://localhost:8080', changeOrigin: true, secure: false },
        '/api/ownership': { target: 'http://localhost:8080', changeOrigin: true, secure: false },
        '/api/products': { target: 'http://localhost:8080', changeOrigin: true, secure: false },

        // --- 2. Luồng NestJS (3000) ---
        // Chứa các chức năng AI Search / GeoSearch
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
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