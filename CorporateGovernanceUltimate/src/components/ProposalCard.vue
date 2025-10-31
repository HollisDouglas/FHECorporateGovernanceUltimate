<template>
  <div class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden">
    <div class="p-6">
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span
              class="px-3 py-1 text-xs font-semibold rounded-full"
              :class="proposalTypeClass"
            >
              {{ ProposalTypeLabels[proposal.proposalType] }}
            </span>
            <span
              class="px-3 py-1 text-xs font-semibold rounded-full"
              :class="statusClass"
            >
              {{ statusText }}
            </span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            {{ proposal.title }}
          </h3>
          <p v-if="proposal.description" class="text-sm text-gray-600">
            {{ proposal.description }}
          </p>
        </div>
      </div>

      <div class="space-y-3 mb-4">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600">Proposer</span>
          <span class="font-mono text-gray-900">{{ formatAddress(proposal.proposer) }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600">Deadline</span>
          <span class="font-medium text-gray-900">{{ formatDate(proposal.deadline) }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600">Time Remaining</span>
          <span class="font-medium" :class="timeRemainingClass">
            {{ formatTimeRemaining(proposal.deadline) }}
          </span>
        </div>
      </div>

      <div v-if="showVoteButton" class="mt-6">
        <button
          @click="emit('vote', proposal.id)"
          class="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          :disabled="!canVote"
          :class="{ 'opacity-50 cursor-not-allowed': !canVote }"
        >
          <div class="flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ proposal.hasVoted ? 'Already Voted' : 'Cast Vote' }}
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Proposal } from '@/types'
import { ProposalTypeLabels } from '@/types'
import { formatAddress, formatDate, formatTimeRemaining } from '@/utils/formatters'

const props = defineProps<{
  proposal: Proposal
  showVoteButton?: boolean
}>()

const emit = defineEmits<{
  vote: [id: number]
}>()

const statusText = computed(() => {
  if (props.proposal.executed) return 'Executed'
  if (!props.proposal.active) return 'Closed'
  const now = Math.floor(Date.now() / 1000)
  if (now > props.proposal.deadline) return 'Expired'
  return 'Active'
})

const statusClass = computed(() => {
  const status = statusText.value
  if (status === 'Active') return 'bg-green-100 text-green-800'
  if (status === 'Expired') return 'bg-yellow-100 text-yellow-800'
  if (status === 'Executed') return 'bg-blue-100 text-blue-800'
  return 'bg-gray-100 text-gray-800'
})

const proposalTypeClass = computed(() => {
  const colors = [
    'bg-purple-100 text-purple-800',
    'bg-blue-100 text-blue-800',
    'bg-red-100 text-red-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-indigo-100 text-indigo-800',
  ]
  return colors[props.proposal.proposalType] || 'bg-gray-100 text-gray-800'
})

const timeRemainingClass = computed(() => {
  const now = Math.floor(Date.now() / 1000)
  const remaining = props.proposal.deadline - now
  if (remaining <= 0) return 'text-red-600'
  if (remaining < 86400) return 'text-yellow-600'
  return 'text-green-600'
})

const canVote = computed(() => {
  if (props.proposal.hasVoted) return false
  if (!props.proposal.active || props.proposal.executed) return false
  const now = Math.floor(Date.now() / 1000)
  return now <= props.proposal.deadline
})
</script>
