<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 mb-2">All Proposals</h1>
            <p class="text-gray-600">Browse and vote on governance proposals</p>
          </div>
          <button
            v-if="walletState.isConnected"
            @click="showCreateModal = true"
            class="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Proposal
            </div>
          </button>
        </div>
      </div>

      <div v-if="!walletState.isConnected" class="text-center py-20">
        <div class="max-w-md mx-auto">
          <svg class="w-24 h-24 mx-auto text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p class="text-gray-600">
            Please connect your wallet to view and interact with proposals
          </p>
        </div>
      </div>

      <div v-else>
        <div v-if="isLoading" class="text-center py-12">
          <div class="inline-block w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p class="mt-4 text-gray-600">Loading proposals...</p>
        </div>

        <div v-else-if="proposals.length === 0" class="text-center py-12 bg-white rounded-xl shadow-md">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No Proposals Yet</h3>
          <p class="text-gray-600 mb-6">Be the first to create a governance proposal</p>
          <button
            @click="showCreateModal = true"
            class="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
          >
            Create Proposal
          </button>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProposalCard
            v-for="proposal in proposals"
            :key="proposal.id"
            :proposal="proposal"
            :show-vote-button="proposal.active && !proposal.executed"
            @vote="openVoteModal"
          />
        </div>
      </div>
    </div>

    <VoteModal
      v-model="showVoteModal"
      :proposal="selectedProposal"
      :fhevm-available="fhevmAvailable"
      @vote="handleVote"
    />

    <CreateProposalModal
      v-model="showCreateModal"
      @create="handleCreateProposal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWallet } from '@/composables/useWallet'
import { useContract } from '@/composables/useContract'
import ProposalCard from '@/components/ProposalCard.vue'
import VoteModal from '@/components/VoteModal.vue'
import CreateProposalModal from '@/components/CreateProposalModal.vue'
import type { Proposal } from '@/types'

const { walletState } = useWallet()
const { proposals, isLoading, fhevmAvailable, castVote, createProposal } = useContract()

const showVoteModal = ref(false)
const showCreateModal = ref(false)
const selectedProposal = ref<Proposal | null>(null)

function openVoteModal(proposalId: number) {
  const proposal = proposals.value.find(p => p.id === proposalId)
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

async function handleCreateProposal(data: { type: number; title: string; duration: number }) {
  const success = await createProposal(data.type, data.title, data.duration)
  if (success) {
    showCreateModal.value = false
  }
}
</script>
