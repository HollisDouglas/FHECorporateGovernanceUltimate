<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b border-gray-200">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-8">
            <router-link to="/" class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 class="text-xl font-bold text-gray-900">Corporate Governance</h1>
                <p class="text-xs text-gray-500">Confidential Voting with FHE</p>
              </div>
            </router-link>

            <div class="hidden md:flex items-center gap-2">
              <router-link
                to="/"
                class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                :class="isActiveRoute('/') ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'"
              >
                Dashboard
              </router-link>
              <router-link
                to="/proposals"
                class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                :class="isActiveRoute('/proposals') ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'"
              >
                Proposals
              </router-link>
            </div>
          </div>

          <WalletConnect />
        </div>
      </nav>
    </header>

    <main>
      <router-view />
    </main>

    <footer class="bg-white border-t border-gray-200 mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
            </svg>
            <span>Powered by Fully Homomorphic Encryption (FHE)</span>
          </div>
          <div class="text-sm text-gray-500">
            Built with Vue 3 & FHEVM SDK
          </div>
        </div>
      </div>
    </footer>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import WalletConnect from '@/components/WalletConnect.vue'
import Toast from '@/components/Toast.vue'

const route = useRoute()

function isActiveRoute(path: string): boolean {
  return route.path === path
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
}
</style>
