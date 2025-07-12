import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@lib': resolve(__dirname, 'src/lib'),
      '@services': resolve(__dirname, 'src/services'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: id => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }

          if (id.includes('src/pages/duplex')) {
            return 'duplex';
          }
          if (id.includes('src/pages/transform')) {
            return 'transform';
          }
          if (id.includes('src/pages/pipe')) {
            return 'pipe';
          }
          if (id.includes('src/pages/writable')) {
            return 'writable';
          }
          if (id.includes('src/pages/readable')) {
            return 'readable';
          }
        },
      },
    },
  },
});
