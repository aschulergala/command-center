<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { NFTDisplay } from '@shared/types/display'
import { useBurnNFT } from '@/composables/useBurnNFT'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

interface Props {
  nft: NFTDisplay | null
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: [nft: NFTDisplay]
}>()

// Composables
const { executeBurn, isBurning, error: burnError, ownerAddress, clearError, canBurnNFT } = useBurnNFT()

// Dialog ref
const dialogRef = ref<HTMLDialogElement | null>(null)

// Local state
const showConfirmation = ref(false)
const localError = ref<string | null>(null)
const confirmation = ref(false)

// Computed: combined error
const displayError = computed(() => localError.value || burnError.value)

// Computed: can continue to confirmation
const canContinue = computed(() => confirmation.value && !isBurning.value)

// Computed: Check if NFT can be burned
const burnCheck = computed(() => {
  if (!props.nft) return { canBurn: false, reason: 'No NFT selected.' }
  return canBurnNFT(props.nft)
})

// Truncate instance ID for display
function truncateInstance(instance: string): string {
  if (instance.length > 8) {
    return `${instance.slice(0, 4)}...${instance.slice(-4)}`
  }
  return instance
}

// Truncate address for display
function truncateAddress(address: string): string {
  if (!address) return ''
  if (address.length <= 20) return address
  return `${address.slice(0, 12)}...${address.slice(-8)}`
}

// Watch for open state changes
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    showDialog()
  } else {
    hideDialog()
  }
})

// Watch for NFT changes to reset form
watch(() => props.nft, () => {
  resetFormState()
})

function showDialog() {
  if (dialogRef.value) {
    dialogRef.value.showModal()
    resetFormState()
  }
}

function hideDialog() {
  if (dialogRef.value) {
    dialogRef.value.close()
  }
}

function resetFormState() {
  confirmation.value = false
  showConfirmation.value = false
  localError.value = null
  clearError()
}

function handleClose() {
  resetFormState()
  emit('close')
}

// Handle clicks on dialog backdrop
function handleDialogClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target === dialogRef.value) {
    handleClose()
  }
}

// Handle ESC key
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    handleClose()
  }
}

// Go to confirmation step
function goToConfirmation() {
  if (!confirmation.value) return
  showConfirmation.value = true
  localError.value = null
}

// Go back to form
function goBackToForm() {
  showConfirmation.value = false
}

// Execute the burn
async function confirmBurn() {
  if (!props.nft) return

  localError.value = null

  const result = await executeBurn(props.nft)

  if (result.success) {
    emit('success', props.nft)
    handleClose()
  } else {
    // Show error in confirmation view
    localError.value = result.error || 'Burn failed'
  }
}

onMounted(() => {
  if (props.open) {
    showDialog()
  }
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <dialog
    ref="dialogRef"
    class="fixed inset-0 m-auto w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl backdrop:bg-black/50 p-0 open:flex open:flex-col"
    @click="handleDialogClick"
  >
    <div v-if="nft" class="flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ showConfirmation ? 'Confirm Burn' : 'Burn NFT' }}
        </h2>
        <button
          type="button"
          class="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          :disabled="isBurning"
          @click="handleClose"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-6 py-4">
        <!-- Error Display -->
        <div
          v-if="displayError"
          class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div class="flex items-start gap-2">
            <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p class="text-sm text-red-700 dark:text-red-300">{{ displayError }}</p>
          </div>
        </div>

        <!-- Cannot Burn Warning -->
        <div
          v-if="!burnCheck.canBurn"
          class="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
        >
          <div class="flex items-start gap-3">
            <svg class="w-6 h-6 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p class="text-sm text-yellow-700 dark:text-yellow-300">{{ burnCheck.reason }}</p>
          </div>
        </div>

        <!-- Form View -->
        <div v-if="!showConfirmation">
          <!-- NFT Preview -->
          <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="flex items-start gap-4">
              <!-- NFT Image/Placeholder -->
              <div class="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-red-500/20 to-orange-600/20">
                <img
                  v-if="nft.image"
                  :src="nft.image"
                  :alt="nft.name"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center"
                >
                  <svg
                    class="w-8 h-8 text-red-500/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>

              <!-- NFT Info -->
              <div class="flex-1 min-w-0">
                <h3 class="font-medium text-gray-900 dark:text-white truncate" :title="nft.name">
                  {{ nft.name }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 truncate" :title="nft.collection">
                  {{ nft.collection }}
                </p>
                <div class="mt-2 flex items-center gap-2">
                  <span class="text-xs text-gray-400 dark:text-gray-500">ID:</span>
                  <span
                    class="text-xs font-mono text-gray-600 dark:text-gray-300"
                    :title="nft.instance"
                  >
                    #{{ truncateInstance(nft.instance) }}
                  </span>
                </div>
                <div
                  v-if="nft.rarity"
                  class="mt-2"
                >
                  <span
                    class="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                  >
                    {{ nft.rarity }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Warning Banner -->
          <div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 class="font-semibold text-red-800 dark:text-red-300">
                  This NFT will be permanently destroyed
                </h4>
                <p class="text-sm text-red-700 dark:text-red-400 mt-1">
                  Burning this NFT will remove it from existence forever. This action cannot be reversed.
                  The NFT cannot be recovered or recreated once burned.
                </p>
              </div>
            </div>
          </div>

          <!-- Confirmation Checkbox -->
          <div class="mb-6">
            <label class="flex items-start gap-3 cursor-pointer">
              <input
                v-model="confirmation"
                type="checkbox"
                class="mt-1 w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                :disabled="isBurning || !burnCheck.canBurn"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">
                I understand that burning this NFT is permanent and cannot be undone
              </span>
            </label>
          </div>
        </div>

        <!-- Confirmation View -->
        <div v-else>
          <div class="space-y-4">
            <!-- Burn Summary -->
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">NFT</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ nft.name }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">Collection</span>
                <span class="text-sm text-gray-900 dark:text-white">
                  {{ nft.collection }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">Instance ID</span>
                <span
                  class="text-sm font-mono text-gray-900 dark:text-white"
                  :title="nft.instance"
                >
                  #{{ truncateInstance(nft.instance) }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">From Wallet</span>
                <span
                  class="text-sm font-mono text-gray-900 dark:text-white"
                  :title="ownerAddress"
                >
                  {{ truncateAddress(ownerAddress) }}
                </span>
              </div>
              <hr class="border-gray-200 dark:border-gray-700" />
              <div class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">Action</span>
                <span class="text-sm font-medium text-red-600 dark:text-red-400">
                  Permanently Destroy
                </span>
              </div>
            </div>

            <!-- Final Warning -->
            <div class="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg">
              <div class="flex items-start gap-3">
                <svg class="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 class="font-semibold text-red-800 dark:text-red-300">
                    Final Warning
                  </h4>
                  <p class="text-sm text-red-700 dark:text-red-400 mt-1">
                    You are about to permanently destroy <strong>{{ nft.name }}</strong> (ID: #{{ truncateInstance(nft.instance) }}).
                    This action cannot be reversed. Please confirm by clicking the button below.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
        <template v-if="!showConfirmation">
          <button
            type="button"
            class="flex-1 btn-secondary"
            :disabled="isBurning"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            type="button"
            class="flex-1 px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!canContinue || !burnCheck.canBurn"
            @click="goToConfirmation"
          >
            Continue
          </button>
        </template>
        <template v-else>
          <button
            type="button"
            class="flex-1 btn-secondary"
            :disabled="isBurning"
            @click="goBackToForm"
          >
            Back
          </button>
          <button
            type="button"
            class="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            :disabled="isBurning"
            @click="confirmBurn"
          >
            <LoadingSpinner v-if="isBurning" size="sm" />
            <span>{{ isBurning ? 'Burning...' : 'Confirm Burn' }}</span>
          </button>
        </template>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

dialog {
  border: none;
}

dialog:not([open]) {
  display: none;
}
</style>
