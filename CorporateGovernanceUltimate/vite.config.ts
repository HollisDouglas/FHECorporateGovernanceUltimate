import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    nodePolyfills({
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
      '@composables': path.resolve(__dirname, './src/composables'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@views': path.resolve(__dirname, './src/views'),
      '@fhevm/sdk': path.resolve(__dirname, '../../packages/fhevm-sdk/src/index.ts'),
      '@fhevm/sdk/core': path.resolve(__dirname, '../../packages/fhevm-sdk/src/core/index.ts'),
    },
  },

  define: {
    global: 'globalThis',
  },

  server: {
    host: '0.0.0.0',
    port: 3001,
    hmr: {
      overlay: false
    }
  },

  preview: {
    host: '0.0.0.0',
    port: 3019
  },

  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          web3: ['ethers', 'fhevmjs']
        }
      }
    }
  },

  optimizeDeps: {
    include: ['buffer', 'process']
  },

  envPrefix: 'VITE_'
})
