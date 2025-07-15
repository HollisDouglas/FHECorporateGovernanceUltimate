import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // 为Web3提供必要的Node.js polyfills
      include: ['buffer', 'crypto', 'stream', 'util', 'process'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@store': path.resolve(__dirname, './src/store'),
    },
  },
  
  define: {
    // 为生产环境定义全局变量
    global: 'globalThis',
  },
  
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: {
      overlay: false
    }
  },
  
  preview: {
    host: '0.0.0.0',
    port: 3018
  },
  
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          web3: ['ethers'],
          ui: ['lucide-react', 'react-hot-toast']
        }
      }
    }
  },
  
  optimizeDeps: {
    include: ['buffer', 'process']
  },
  
  // 环境变量配置
  envPrefix: 'VITE_'
})