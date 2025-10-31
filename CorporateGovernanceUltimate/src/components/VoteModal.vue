<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
        @click.self="close"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-up">
          <div class="bg-gradient-to-r from-primary-600 to-primary-700 p-6">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold text-white">Cast Your Vote</h2>
              <button
                @click="close"
                class="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div class="p-6">
            <div v-if="proposal" class="mb-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ proposal.title }}</h3>
              <p v-if="proposal.description" class="text-sm text-gray-600 mb-4">
                {{ proposal.description }}
              </p>
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ formatTimeRemaining(proposal.deadline) }}
              </div>
            </div>

            <div class="space-y-3 mb-6">
              <button
                v-for="choice in voteChoices"
                :key="choice.value"
                @click="selectedChoice = choice.value"
                class="w-full p-4 border-2 rounded-lg transition-all text-left"
                :class="selectedChoice === choice.value
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                "
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                      :class="selectedChoice === choice.value
                        ? 'border-primary-600 bg-primary-600'
                        : 'border-gray-300'
                      "
                    >
                      <div v-if="selectedChoice === choice.value" class="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span class="font-medium text-gray-900">{{ choice.label }}</span>
                  </div>
                  <span class="text-2xl">{{ choice.icon }}</span>
                </div>
              </button>
            </div>

            <div v-if="fhevmAvailable" class="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div class="flex items-start gap-3">
                <input
                  v-model="useEncryption"
                  type="checkbox"
                  id="encryption"
                  class="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label for="encryption" class="flex-1 cursor-pointer">
                  <div class="flex items-center gap-2 mb-1">
                    <svg class="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm font-semibold text-purple-900">Use FHE Encryption</span>
                  </div>
                  <p class="text-xs text-purple-700">
                    Your vote will be encrypted using Fully Homomorphic Encryption for maximum privacy
                  </p>
                </label>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                @click="close"
                class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="submitVote"
                :disabled="selectedChoice === null || isSubmitting"
                class="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="!isSubmitting">Confirm Vote</span>
                <span v-else class="flex items-center justify-center gap-2">
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Proposal } from '@/types'
import { VoteChoice } from '@/types'
import { formatTimeRemaining } from '@/utils/formatters'

const props = defineProps<{
  modelValue: boolean
  proposal: Proposal | null
  fhevmAvailable: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'vote': [choice: number, useEncryption: boolean]
}>()

const selectedChoice = ref<number | null>(null)
const useEncryption = ref(true)
const isSubmitting = ref(false)

const voteChoices = [
  { value: VoteChoice.FOR, label: 'Vote For', icon: '✓' },
  { value: VoteChoice.AGAINST, label: 'Vote Against', icon: '✗' },
  { value: VoteChoice.ABSTAIN, label: 'Abstain', icon: '○' },
]

function close() {
  emit('update:modelValue', false)
  selectedChoice.value = null
  isSubmitting.value = false
}

async function submitVote() {
  if (selectedChoice.value === null) return

  isSubmitting.value = true
  emit('vote', selectedChoice.value, useEncryption.value)

  setTimeout(() => {
    isSubmitting.value = false
    close()
  }, 1000)
}

watch(() => props.modelValue, (value) => {
  if (!value) {
    selectedChoice.value = null
    isSubmitting.value = false
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
