<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import type { NFTDisplay } from '@shared/types/display'
import { createTransferNFTSchema, truncateAddress, truncateInstanceId } from '@/lib/schemas/transferNFTSchema'
import { useTransferNFT } from '@/composables/useTransferNFT'
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

// Transfer composable
const { executeTransfer, isTransferring, error: transferError, fromAddress, clearError } = useTransferNFT()

// Dialog ref
const dialogRef = ref<HTMLDialogElement | null>(null)

// Local state
const showConfirmation = ref(false)
const localError = ref<string | null>(null)

// Computed: validation schema
const validationSchema = computed(() => {
  return toTypedSchema(createTransferNFTSchema(fromAddress.value))
})

// Form setup with VeeValidate
const { handleSubmit, resetForm, meta } = useForm({
  validationSchema,
})

// Fields
const { value: recipientAddress, errorMessage: recipientError } = useField<string>('recipientAddress')

// Initialize field values
recipientAddress.value = ''

// Computed: form can submit
const canSubmit = computed(() => {
  return meta.value.valid && !isTransferring.value && recipientAddress.value
})

// Computed: combined error
const displayError = computed(() => localError.value || transferError.value)

// Computed: formatted instance ID for display
const displayInstanceId = computed(() => {
  if (!props.nft) return ''
  return truncateInstanceId(props.nft.instance)
})

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
  resetForm()
  recipientAddress.value = ''
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
const goToConfirmation = handleSubmit(() => {
  showConfirmation.value = true
  localError.value = null
})

// Go back to form
function goBackToForm() {
  showConfirmation.value = false
}

// Execute the transfer
async function confirmTransfer() {
  if (!props.nft) return

  localError.value = null

  const result = await executeTransfer(
    props.nft,
    recipientAddress.value
  )

  if (result.success) {
    emit('success', props.nft)
    handleClose()
  } else {
    // Show error in confirmation view
    localError.value = result.error || 'Transfer failed'
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
          {{ showConfirmation ? 'Confirm Transfer' : 'Transfer NFT' }}
        </h2>
        <button
          type="button"
          class="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          :disabled="isTransferring"
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

        <!-- NFT Preview (shown in both views) -->
        <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div class="flex items-start gap-4">
            <!-- NFT Image/Placeholder -->
            <div class="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-gala-primary/20 to-gala-secondary/20">
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
                  class="w-8 h-8 text-gala-primary/40"
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
              <h3 class="font-semibold text-gray-900 dark:text-white truncate" :title="nft.name">
                {{ nft.name }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 truncate" :title="nft.collection">
                {{ nft.collection }}
              </p>
              <div class="mt-1 flex items-center gap-2">
                <span class="text-xs text-gray-400 dark:text-gray-500">ID:</span>
                <span
                  class="text-xs font-mono text-gray-600 dark:text-gray-300"
                  :title="nft.instance"
                >
                  #{{ displayInstanceId }}
                </span>
              </div>
              <!-- Rarity badge if available -->
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

        <!-- Form View -->
        <div v-if="!showConfirmation">
          <!-- Transfer Form -->
          <form @submit.prevent="goToConfirmation">
            <!-- Recipient Address -->
            <div class="mb-4">
              <label
                for="recipientAddress"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Recipient Address
              </label>
              <input
                id="recipientAddress"
                v-model="recipientAddress"
                type="text"
                placeholder="client|abc123... or 0x..."
                class="input w-full"
                :class="{ 'border-red-500 dark:border-red-500': recipientError }"
                :disabled="isTransferring"
              />
              <p v-if="recipientError" class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ recipientError }}
              </p>
              <p v-else class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Enter the GalaChain address of the recipient
              </p>
            </div>
          </form>
        </div>

        <!-- Confirmation View -->
        <div v-else>
          <div class="space-y-4">
            <!-- Transfer Summary -->
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">NFT</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ nft.name }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">Collection</span>
                <span
                  class="text-sm text-gray-900 dark:text-white"
                  :title="nft.collection"
                >
                  {{ nft.collection.length > 20 ? nft.collection.slice(0, 20) + '...' : nft.collection }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">Instance ID</span>
                <span class="text-sm font-mono text-gray-900 dark:text-white">
                  #{{ displayInstanceId }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">To</span>
                <span
                  class="text-sm font-mono text-gray-900 dark:text-white"
                  :title="recipientAddress"
                >
                  {{ truncateAddress(recipientAddress) }}
                </span>
              </div>
            </div>

            <!-- Warning -->
            <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p class="text-sm text-yellow-700 dark:text-yellow-300">
                  Please verify the recipient address carefully. NFT transfers cannot be reversed.
                </p>
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
            :disabled="isTransferring"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            type="button"
            class="flex-1 btn-primary"
            :disabled="!canSubmit"
            @click="goToConfirmation"
          >
            Continue
          </button>
        </template>
        <template v-else>
          <button
            type="button"
            class="flex-1 btn-secondary"
            :disabled="isTransferring"
            @click="goBackToForm"
          >
            Back
          </button>
          <button
            type="button"
            class="flex-1 btn-primary flex items-center justify-center gap-2"
            :disabled="isTransferring"
            @click="confirmTransfer"
          >
            <LoadingSpinner v-if="isTransferring" size="sm" />
            <span>{{ isTransferring ? 'Transferring...' : 'Confirm Transfer' }}</span>
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
