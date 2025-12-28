import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'framer-motion': ['framer-motion'],
        },
      },
    },
    // Ensure proper Safari compatibility
    target: 'es2015',
    minify: 'esbuild',
  },
  server: {
    port: 4000,
    host: '0.0.0.0',
    strictPort: false,
    hmr: {
      clientPort: 4000
    },
    proxy: {
      '/api': {
        target: 'https://magicwork-six.vercel.app',
        changeOrigin: true,
        secure: true
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})

