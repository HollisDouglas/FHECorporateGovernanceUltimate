import { ref, computed, watch } from 'vue'
import { createInstance, FHEVMInstance } from 'fhevmjs'
import { useWallet } from './useWallet'
import { SEPOLIA_CONFIG, CONTRACT_ADDRESS } from '@/utils/constants'
import { toast } from '@/utils/toast'

const fhevmInstance = ref<FHEVMInstance | null>(null)
const isInitializing = ref(false)
const isInitialized = ref(false)
const error = ref<string | null>(null)

export function useFHEVM() {
  const { walletState, provider } = useWallet()

  async function initializeFHEVM() {
    if (isInitializing.value || isInitialized.value) return
    if (!provider.value || !walletState.value.isConnected) return

    try {
      isInitializing.value = true
      error.value = null

      const toastId = toast.loading('Initializing FHE encryption...')

      const instance = await createInstance({
        chainId: SEPOLIA_CONFIG.chainId,
        networkUrl: SEPOLIA_CONFIG.rpcUrl,
        gatewayUrl: 'https://gateway.sepolia.zama.ai',
        aclAddress: '0x8f4355c1f3F1EDC5f4e7a3E9F6c5b9F7F8F4355c',
      })

      fhevmInstance.value = instance
      isInitialized.value = true

      toast.success('FHE encryption ready', { id: toastId })
    } catch (err: any) {
      console.error('Failed to initialize FHEVM:', err)
      error.value = err.message
      toast.error('Failed to initialize FHE encryption')
    } finally {
      isInitializing.value = false
    }
  }

  async function encryptVote(vote: number): Promise<any> {
    if (!fhevmInstance.value || !walletState.value.account) {
      throw new Error('FHEVM not initialized or wallet not connected')
    }

    try {
      const input = fhevmInstance.value.createEncryptedInput(
        CONTRACT_ADDRESS,
        walletState.value.account
      )

      input.add8(vote)

      return input.encrypt()
    } catch (err: any) {
      console.error('Encryption failed:', err)
      throw new Error('Failed to encrypt vote')
    }
  }

  async function getPublicKey(): Promise<string> {
    if (!fhevmInstance.value) {
      throw new Error('FHEVM not initialized')
    }

    return fhevmInstance.value.getPublicKey(CONTRACT_ADDRESS) || ''
  }

  watch(
    () => walletState.value.isConnected,
    (connected) => {
      if (connected && !isInitialized.value && !isInitializing.value) {
        initializeFHEVM()
      }
    },
    { immediate: true }
  )

  return {
    fhevmInstance: computed(() => fhevmInstance.value),
    isInitialized: computed(() => isInitialized.value),
    isInitializing: computed(() => isInitializing.value),
    error: computed(() => error.value),
    initializeFHEVM,
    encryptVote,
    getPublicKey
  }
}
