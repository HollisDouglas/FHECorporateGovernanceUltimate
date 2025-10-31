<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="min-w-[300px] max-w-md p-4 rounded-lg shadow-lg backdrop-blur-sm animate-slide-up"
      :class="toastClasses(toast.type)"
    >
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0">
          <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <svg v-else-if="toast.type === 'error'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <svg v-else-if="toast.type === 'loading'" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
        <button
          v-if="toast.type !== 'loading'"
          @click="dismissToast(toast.id!)"
          class="flex-shrink-0 ml-2 text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { toast } from '@/utils/toast'
import type { ToastMessage } from '@/types'

const toasts = ref<ToastMessage[]>([])

let unsubscribe: (() => void) | null = null

function toastClasses(type: ToastMessage['type']) {
  const base = 'border'
  switch (type) {
    case 'success':
      return `${base} bg-green-50 border-green-200 text-green-800`
    case 'error':
      return `${base} bg-red-50 border-red-200 text-red-800`
    case 'loading':
      return `${base} bg-blue-50 border-blue-200 text-blue-800`
    default:
      return `${base} bg-blue-50 border-blue-200 text-blue-800`
  }
}

function dismissToast(id: string) {
  toast.dismiss(id)
}

onMounted(() => {
  unsubscribe = toast.subscribe((newToasts) => {
    toasts.value = newToasts
  })
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>
