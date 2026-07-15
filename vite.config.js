import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          'vendor-react': ['react', 'react-dom'],
          // Routing
          'vendor-router': ['react-router-dom'],
          // Animations (framer-motion is large ~300kB)
          'vendor-framer': ['framer-motion'],
          // QR code libraries
          'vendor-qr': ['qrcode.react', 'html5-qrcode'],
          // Toast notifications
          'vendor-toast': ['react-hot-toast'],
        },
      },
    },
  },
});
