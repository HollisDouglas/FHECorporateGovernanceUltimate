<template>
  <div class="flex items-center gap-4">
    <button
      v-if="!walletState.isConnected && !walletState.isConnecting"
      @click="connectWallet"
      class="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
    >
      Connect Wallet
    </button>

    <button
      v-else-if="walletState.isConnecting"
      disabled
      class="px-6 py-2.5 bg-gray-400 text-white font-medium rounded-lg cursor-not-allowed opacity-70"
    >
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Connecting...
      </div>
    </button>

    <div v-else class="flex items-center gap-3">
      <div
        v-if="!isCorrectNetwork"
        class="flex items-center gap-2 px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-lg"
      >
        <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span class="text-sm font-medium text-yellow-800">Wrong Network</span>
        <button
          @click="switchToSepolia"
          class="ml-2 px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
        >
          Switch to Sepolia
        </button>
      </div>

      <div class="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span class="text-sm font-mono text-gray-700">
          {{ formatAddress(walletState.account!) }}
        </span>
        <span v-if="walletState.balance" class="text-sm text-gray-500 ml-2">
          {{ formatBalance(walletState.balance) }} ETH
        </span>
      </div>

      <button
        @click="disconnectWallet"
        class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Disconnect"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWallet } from '@/composables/useWallet'
import { formatAddress, formatBalance } from '@/utils/formatters'

const { walletState, isCorrectNetwork, connectWallet, disconnectWallet, switchToSepolia } = useWallet()
</script>
