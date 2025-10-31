<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
        @click.self="close"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-slide-up">
          <div class="bg-gradient-to-r from-primary-600 to-primary-700 p-6">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold text-white">Create New Proposal</h2>
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

          <form @submit.prevent="submitProposal" class="p-6 space-y-6">
            <div>
              <label for="title" class="block text-sm font-semibold text-gray-700 mb-2">
                Proposal Title
              </label>
              <input
                v-model="formData.title"
                type="text"
                id="title"
                required
                maxlength="200"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Enter proposal title..."
              />
            </div>

            <div>
              <label for="type" class="block text-sm font-semibold text-gray-700 mb-2">
                Proposal Type
              </label>
              <select
                v-model="formData.type"
                id="type"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                <option :value="ProposalType.BOARD">Board Election</option>
                <option :value="ProposalType.BUDGET">Budget Approval</option>
                <option :value="ProposalType.MERGER">Merger & Acquisition</option>
                <option :value="ProposalType.DIVIDEND">Dividend Distribution</option>
                <option :value="ProposalType.BYLAW">Bylaw Amendment</option>
                <option :value="ProposalType.STRATEGIC">Strategic Decision</option>
              </select>
            </div>

            <div>
              <label for="duration" class="block text-sm font-semibold text-gray-700 mb-2">
                Voting Duration (Days)
              </label>
              <input
                v-model.number="formData.duration"
                type="number"
                id="duration"
                required
                min="1"
                max="30"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Enter duration in days..."
              />
              <p class="mt-2 text-xs text-gray-500">
                Recommended: 7 days for standard proposals, 14 days for major decisions
              </p>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="close"
                class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="!isFormValid"
                class="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Proposal
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ProposalType } from '@/types'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'create': [data: { type: number; title: string; duration: number }]
}>()

const formData = ref({
  title: '',
  type: ProposalType.STRATEGIC,
  duration: 7
})

const isFormValid = computed(() => {
  return formData.value.title.trim().length > 0 &&
    formData.value.duration >= 1 &&
    formData.value.duration <= 30
})

function close() {
  emit('update:modelValue', false)
  resetForm()
}

function resetForm() {
  formData.value = {
    title: '',
    type: ProposalType.STRATEGIC,
    duration: 7
  }
}

function submitProposal() {
  if (!isFormValid.value) return

  emit('create', {
    type: formData.value.type,
    title: formData.value.title.trim(),
    duration: formData.value.duration
  })
}

watch(() => props.modelValue, (value) => {
  if (!value) {
    resetForm()
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
