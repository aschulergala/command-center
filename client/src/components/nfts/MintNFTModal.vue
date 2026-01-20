<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import type { CollectionDisplay } from '@shared/types/display'
import { useMintNFT } from '@/composables/useMintNFT'
import { useNFTMintAuthority } from '@/composables/useNFTMintAuthority'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import BigNumber from 'bignumber.js'

interface Props {
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: [collection: CollectionDisplay, quantity: number]
}>()

// Composables
const { executeMint, isMinting, error: mintError, ownerAddress, clearError } = useMintNFT()
const { authorizedCollections, getMintAllowanceRemaining, getMintAllowanceFormatted } = useNFTMintAuthority()

// Dialog ref
const dialogRef = ref<HTMLDialogElement | null>(null)

// Local state
const showConfirmation = ref(false)
const localError = ref<string | null>(null)
const selectedCollectionKey = ref<string | null>(null)

// Computed: selected collection
const selectedCollection = computed((): CollectionDisplay | null => {
  if (!selectedCollectionKey.value) return null
  return authorizedCollections.value.find(c => c.collectionKey === selectedCollectionKey.value) || null
})

// Computed: mint allowance remaining for selected collection
const mintAllowanceRemaining = computed(() => {
  if (!selectedCollection.value) return '0'
  const allowance = getMintAllowanceRemaining(selectedCollection.value)
  return allowance?.toString() || '0'
})

// Computed: formatted mint allowance for display
const mintAllowanceFormatted = computed(() => {
  if (!selectedCollection.value) return '0'
  return getMintAllowanceFormatted(selectedCollection.value) || mintAllowanceRemaining.value
})

// Computed: max quantity user can mint
const maxMintQuantity = computed(() => {
  const remaining = new BigNumber(mintAllowanceRemaining.value)
  // Cap at a reasonable number for NFT minting UI
  const maxDisplay = 100
  return remaining.isGreaterThan(maxDisplay) ? maxDisplay : remaining.toNumber()
})

// Create validation schema for NFT minting
function createNFTMintSchema(maxQuantity: string) {
  const max = new BigNumber(maxQuantity)

  return z.object({
    quantity: z
      .string()
      .min(1, 'Quantity is required')
      .refine((val) => {
        const num = new BigNumber(val)
        return !num.isNaN() && num.isFinite()
      }, 'Please enter a valid number')
      .refine((val) => {
        const num = new BigNumber(val)
        return num.isGreaterThan(0)
      }, 'Quantity must be greater than 0')
      .refine((val) => {
        const num = new BigNumber(val)
        return num.isInteger()
      }, 'Quantity must be a whole number (NFTs cannot be fractional)')
      .refine((val) => {
        const num = new BigNumber(val)
        return num.isLessThanOrEqualTo(max)
      }, `Quantity cannot exceed your mint allowance of ${maxQuantity}`),
  })
}

// Computed: validation schema with current allowance
const validationSchema = computed(() => {
  return toTypedSchema(createNFTMintSchema(mintAllowanceRemaining.value))
})

// Form setup with VeeValidate
const { handleSubmit, resetForm, meta } = useForm({
  validationSchema,
})

// Fields
const { value: quantity, errorMessage: quantityError } = useField<string>('quantity')

// Initialize field values
quantity.value = '1'

// Computed: form can submit
const canSubmit = computed(() => {
  return meta.value.valid && !isMinting.value && quantity.value && selectedCollection.value
})

// Computed: combined error
const displayError = computed(() => localError.value || mintError.value)

// Watch for open state changes
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    showDialog()
  } else {
    hideDialog()
  }
})

// Watch for collection selection changes to reset quantity validation
watch(selectedCollectionKey, () => {
  quantity.value = '1'
  localError.value = null
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
  quantity.value = '1'
  selectedCollectionKey.value = authorizedCollections.value[0]?.collectionKey || null
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

// Set max quantity
function setMaxQuantity() {
  quantity.value = maxMintQuantity.value.toString()
}

// Increment/decrement quantity
function incrementQuantity() {
  const current = parseInt(quantity.value, 10) || 0
  const max = maxMintQuantity.value
  if (current < max) {
    quantity.value = (current + 1).toString()
  }
}

function decrementQuantity() {
  const current = parseInt(quantity.value, 10) || 0
  if (current > 1) {
    quantity.value = (current - 1).toString()
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

// Execute the mint
async function confirmMint() {
  if (!selectedCollection.value) return

  localError.value = null

  const result = await executeMint(
    selectedCollection.value,
    quantity.value
  )

  if (result.success) {
    emit('success', selectedCollection.value, parseInt(quantity.value, 10))
    handleClose()
  } else {
    // Show error in confirmation view
    localError.value = result.error || 'Mint failed'
  }
}

// Truncate address for display
function truncateAddress(address: string): string {
  if (!address) return ''
  if (address.length <= 20) return address
  return `${address.slice(0, 12)}...${address.slice(-8)}`
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
    class="fixed inset-0 m-0 w-full h-full max-w-none max-h-none bg-white dark:bg-gray-900 rounded-none shadow-2xl backdrop:bg-black/50 p-0 open:flex open:flex-col sm:inset-auto sm:m-auto sm:w-full sm:max-w-md sm:h-auto sm:max-h-[90vh] sm:rounded-xl"
    @click="handleDialogClick"
  >
    <div class="flex flex-col h-full sm:max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ showConfirmation ? 'Confirm NFT Mint' : 'Mint NFT' }}
        </h2>
        <button
          type="button"
          class="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          :disabled="isMinting"
          @click="handleClose"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-6 py-4">
        <!-- No Collections State -->
        <div v-if="authorizedCollections.length === 0" class="text-center py-8">
          <svg
            class="w-12 h-12 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Mint Authority
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            You don't have mint authority for any NFT collections.
          </p>
        </div>

        <template v-else>
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

          <!-- Form View -->
          <div v-if="!showConfirmation">
            <!-- Collection Selector -->
            <div class="mb-6">
              <label
                for="collection"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Collection
              </label>
              <select
                id="collection"
                v-model="selectedCollectionKey"
                class="input w-full"
                :disabled="isMinting || authorizedCollections.length === 1"
              >
                <option
                  v-for="collection in authorizedCollections"
                  :key="collection.collectionKey"
                  :value="collection.collectionKey"
                >
                  {{ collection.name }} ({{ collection.type }})
                </option>
              </select>
              <p v-if="authorizedCollections.length === 1" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Only one collection available for minting.
              </p>
            </div>

            <!-- Collection Info -->
            <div v-if="selectedCollection" class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  :class="selectedCollection.image ? 'bg-transparent' : 'bg-gradient-to-br from-purple-500 to-indigo-600'"
                >
                  <img
                    v-if="selectedCollection.image"
                    :src="selectedCollection.image"
                    :alt="selectedCollection.name"
                    class="w-12 h-12 rounded-lg object-cover"
                  />
                  <svg
                    v-else
                    class="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900 dark:text-white">{{ selectedCollection.name }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ selectedCollection.collection }} / {{ selectedCollection.category }} / {{ selectedCollection.type }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Mint Allowance Info -->
            <div v-if="selectedCollection" class="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p class="text-sm text-green-700 dark:text-green-300">
                    <span class="font-medium">Mint Allowance:</span>
                    {{ mintAllowanceFormatted }} NFTs
                  </p>
                </div>
              </div>
            </div>

            <!-- Mint Form -->
            <form v-if="selectedCollection" @submit.prevent="goToConfirmation">
              <!-- Quantity -->
              <div class="mb-6">
                <label
                  for="quantity"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Quantity to Mint
                </label>
                <div class="flex items-center gap-2">
                  <!-- Decrement button -->
                  <button
                    type="button"
                    class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="isMinting || parseInt(quantity, 10) <= 1"
                    @click="decrementQuantity"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                    </svg>
                  </button>

                  <!-- Input -->
                  <input
                    id="quantity"
                    v-model="quantity"
                    type="text"
                    inputmode="numeric"
                    placeholder="1"
                    class="input flex-1 text-center"
                    :class="{ 'border-red-500 dark:border-red-500': quantityError }"
                    :disabled="isMinting"
                  />

                  <!-- Increment button -->
                  <button
                    type="button"
                    class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="isMinting || parseInt(quantity, 10) >= maxMintQuantity"
                    @click="incrementQuantity"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>

                  <!-- Max button -->
                  <button
                    type="button"
                    class="px-3 py-2 text-sm font-medium text-green-600 hover:text-green-500 border border-green-300 dark:border-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                    :disabled="isMinting"
                    @click="setMaxQuantity"
                  >
                    MAX
                  </button>
                </div>
                <p v-if="quantityError" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {{ quantityError }}
                </p>
                <p v-else class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  You can mint up to {{ mintAllowanceFormatted }} NFTs from this collection.
                </p>
              </div>
            </form>
          </div>

          <!-- Confirmation View -->
          <div v-else-if="selectedCollection">
            <div class="space-y-4">
              <!-- Collection Preview -->
              <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div class="flex items-center gap-3 mb-4">
                  <div
                    class="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold"
                    :class="selectedCollection.image ? 'bg-transparent' : 'bg-gradient-to-br from-purple-500 to-indigo-600'"
                  >
                    <img
                      v-if="selectedCollection.image"
                      :src="selectedCollection.image"
                      :alt="selectedCollection.name"
                      class="w-16 h-16 rounded-lg object-cover"
                    />
                    <svg
                      v-else
                      class="w-8 h-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-gray-900 dark:text-white">{{ selectedCollection.name }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ selectedCollection.type }}
                    </p>
                  </div>
                </div>

                <!-- Mint Summary -->
                <div class="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500 dark:text-gray-400">Collection</span>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ selectedCollection.name }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500 dark:text-gray-400">Quantity to Mint</span>
                    <span class="text-sm font-medium text-green-600 dark:text-green-400">
                      +{{ quantity }} NFT{{ parseInt(quantity, 10) !== 1 ? 's' : '' }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500 dark:text-gray-400">Recipient</span>
                    <span
                      class="text-sm font-mono text-gray-900 dark:text-white"
                      :title="ownerAddress"
                    >
                      {{ truncateAddress(ownerAddress) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Info Notice -->
              <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-sm text-blue-700 dark:text-blue-300">
                    Minting will create {{ quantity }} new NFT{{ parseInt(quantity, 10) !== 1 ? 's' : '' }} in your wallet. Each NFT will have a unique instance ID. This action requires signing with your wallet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
        <template v-if="authorizedCollections.length === 0">
          <button
            type="button"
            class="flex-1 btn-secondary"
            @click="handleClose"
          >
            Close
          </button>
        </template>
        <template v-else-if="!showConfirmation">
          <button
            type="button"
            class="flex-1 btn-secondary"
            :disabled="isMinting"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            type="button"
            class="flex-1 btn-primary bg-green-600 hover:bg-green-700"
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
            :disabled="isMinting"
            @click="goBackToForm"
          >
            Back
          </button>
          <button
            type="button"
            class="flex-1 btn-primary bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
            :disabled="isMinting"
            @click="confirmMint"
          >
            <LoadingSpinner v-if="isMinting" size="sm" />
            <span>{{ isMinting ? 'Minting...' : 'Confirm Mint' }}</span>
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
