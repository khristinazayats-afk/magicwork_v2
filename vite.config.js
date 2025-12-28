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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            return 'vendor';
          }
        },
      },
    },
    // Ensure proper Safari compatibility - use modern target but compatible syntax
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    minify: 'esbuild',
    commonjsOptions: {
      include: [/node_modules/],
    },
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

