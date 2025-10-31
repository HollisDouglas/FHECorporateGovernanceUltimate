<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Governance Dashboard</h1>
        <p class="text-gray-600">Manage and participate in corporate governance</p>
      </div>

      <div v-if="!walletState.isConnected" class="text-center py-20">
        <div class="max-w-md mx-auto">
          <svg class="w-24 h-24 mx-auto text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p class="text-gray-600 mb-8">
            Please connect your wallet to access the governance dashboard
          </p>
        </div>
      </div>

      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Proposals</h3>
              <div class="p-3 bg-primary-100 rounded-lg">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p class="text-3xl font-bold text-gray-900">{{ contractState.totalProposals }}</p>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Proposals</h3>
              <div class="p-3 bg-green-100 rounded-lg">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p class="text-3xl font-bold text-gray-900">{{ activeProposals.length }}</p>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Shares</h3>
              <div class="p-3 bg-purple-100 rounded-lg">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p class="text-3xl font-bold text-gray-900">{{ contractState.totalShares.toLocaleString() }}</p>
          </div>
        </div>

        <div class="mb-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Active Proposals</h2>
            <div v-if="fhevmAvailable" class="flex items-center gap-2 px-4 py-2 bg-purple-100 border border-purple-300 rounded-lg">
              <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm font-semibold text-purple-800">FHE Encryption Active</span>
            </div>
          </div>

          <div v-if="isLoading" class="text-center py-12">
            <div class="inline-block w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <p class="mt-4 text-gray-600">Loading proposals...</p>
          </div>

          <div v-else-if="activeProposals.length === 0" class="text-center py-12 bg-white rounded-xl shadow-md">
            <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">No Active Proposals</h3>
            <p class="text-gray-600">There are currently no active proposals to vote on</p>
          </div>

          <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProposalCard
              v-for="proposal in activeProposals"
              :key="proposal.id"
              :proposal="proposal"
              :show-vote-button="true"
              @vote="openVoteModal"
            />
          </div>
        </div>

        <div v-if="completedProposals.length > 0" class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Completed Proposals</h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProposalCard
              v-for="proposal in completedProposals"
              :key="proposal.id"
              :proposal="proposal"
              :show-vote-button="false"
            />
          </div>
        </div>
      </div>
    </div>

    <VoteModal
      v-model="showVoteModal"
      :proposal="selectedProposal"
      :fhevm-available="fhevmAvailable"
      @vote="handleVote"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWallet } from '@/composables/useWallet'
import { useContract } from '@/composables/useContract'
import ProposalCard from '@/components/ProposalCard.vue'
import VoteModal from '@/components/VoteModal.vue'
import type { Proposal } from '@/types'

const { walletState } = useWallet()
const {
  contractState,
  activeProposals,
  completedProposals,
  isLoading,
  fhevmAvailable,
  castVote
} = useContract()

const showVoteModal = ref(false)
const selectedProposal = ref<Proposal | null>(null)

function openVoteModal(proposalId: number) {
  const proposal = activeProposals.value.find(p => p.id === proposalId)
  if (proposal) {
    selectedProposal.value = proposal
    showVoteModal.value = true
  }
}

async function handleVote(choice: number, useEncryption: boolean) {
  if (!selectedProposal.value) return

  const success = await castVote(selectedProposal.value.id, choice, useEncryption)
  if (success) {
    showVoteModal.value = false
    selectedProposal.value = null
  }
}
</script>
