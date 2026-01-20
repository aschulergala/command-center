<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useForm, useField } from 'vee-validate'
import {
  getCreateCollectionTypedSchema,
  defaultCollectionFormValues,
  formatMaxSupply,
  type CreateCollectionFormValues,
} from '@/lib/schemas/createCollectionSchema'
import { useCreateCollection } from '@/composables/useCreateCollection'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

interface Props {
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: []
}>()

// Composables
const {
  executeCreate,
  isCreating,
  error: createError,
  clearError,
  getCollectionKey,
} = useCreateCollection()

// Dialog ref
const dialogRef = ref<HTMLDialogElement | null>(null)

// Local state
const showConfirmation = ref(false)
const localError = ref<string | null>(null)
const showAdvanced = ref(false)

// Validation schema
const validationSchema = computed(() => getCreateCollectionTypedSchema())

// Form setup with VeeValidate
const { handleSubmit, resetForm, meta, values } = useForm<CreateCollectionFormValues>({
  validationSchema,
  initialValues: defaultCollectionFormValues,
})

// Fields
const { value: collection, errorMessage: collectionError } = useField<string>('collection')
const { value: category, errorMessage: categoryError } = useField<string>('category')
const { value: type, errorMessage: typeError } = useField<string>('type')
const { value: additionalKey, errorMessage: additionalKeyError } = useField<string>('additionalKey')
const { value: name, errorMessage: nameError } = useField<string>('name')
const { value: symbol, errorMessage: symbolError } = useField<string>('symbol')
const { value: description, errorMessage: descriptionError } = useField<string>('description')
const { value: image, errorMessage: imageError } = useField<string>('image')
const { value: isNonFungible } = useField<boolean>('isNonFungible')
const { value: decimals, errorMessage: decimalsError } = useField<number>('decimals')
const { value: maxSupply, errorMessage: maxSupplyError } = useField<string>('maxSupply')

// Computed: form can submit
const canSubmit = computed(() => {
  return meta.value.valid && !isCreating.value
})

// Computed: combined error
const displayError = computed(() => localError.value || createError.value)

// Computed: preview of collection key
const collectionKeyPreview = computed(() => {
  return getCollectionKey(values)
})

// Watch for open state changes
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    showDialog()
  } else {
    hideDialog()
  }
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
  // Re-apply defaults
  collection.value = ''
  category.value = 'Item'
  type.value = ''
  additionalKey.value = 'none'
  name.value = ''
  symbol.value = ''
  description.value = ''
  image.value = ''
  isNonFungible.value = true
  decimals.value = 0
  maxSupply.value = ''
  showConfirmation.value = false
  showAdvanced.value = false
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

// Execute the collection creation
async function confirmCreate() {
  localError.value = null

  const formValues: CreateCollectionFormValues = {
    collection: collection.value,
    category: category.value,
    type: type.value,
    additionalKey: additionalKey.value || 'none',
    name: name.value,
    symbol: symbol.value,
    description: description.value,
    image: image.value,
    isNonFungible: isNonFungible.value,
    decimals: decimals.value,
    maxSupply: maxSupply.value,
  }

  const result = await executeCreate(formValues)

  if (result.success) {
    emit('success')
    handleClose()
  } else {
    localError.value = result.error || 'Failed to create collection'
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
    class="fixed inset-0 m-0 w-full h-full max-w-none max-h-none bg-white dark:bg-gray-900 rounded-none shadow-2xl backdrop:bg-black/50 p-0 open:flex open:flex-col sm:inset-auto sm:m-auto sm:w-full sm:max-w-lg sm:h-auto sm:max-h-[90vh] sm:rounded-xl"
    @click="handleDialogClick"
  >
    <div class="flex flex-col h-full sm:max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ showConfirmation ? 'Confirm Collection' : 'Create Collection' }}
        </h2>
        <button
          type="button"
          class="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          :disabled="isCreating"
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

        <!-- Form View -->
        <div v-if="!showConfirmation">
          <form @submit.prevent="goToConfirmation" class="space-y-6">
            <!-- Basic Info Section -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Basic Information
              </h3>

              <!-- Name -->
              <div class="mb-4">
                <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  id="name"
                  v-model="name"
                  type="text"
                  placeholder="My Awesome Collection"
                  class="input w-full"
                  :class="{ 'border-red-500 dark:border-red-500': nameError }"
                  :disabled="isCreating"
                />
                <p v-if="nameError" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {{ nameError }}
                </p>
              </div>

              <!-- Symbol -->
              <div class="mb-4">
                <label for="symbol" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Symbol *
                </label>
                <input
                  id="symbol"
                  v-model="symbol"
                  type="text"
                  placeholder="MAC"
                  maxlength="10"
                  class="input w-full uppercase"
                  :class="{ 'border-red-500 dark:border-red-500': symbolError }"
                  :disabled="isCreating"
                />
                <p v-if="symbolError" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {{ symbolError }}
                </p>
                <p v-else class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Short identifier (max 10 characters)
                </p>
              </div>

              <!-- Description -->
              <div class="mb-4">
                <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  v-model="description"
                  rows="3"
                  placeholder="Describe your collection..."
                  class="input w-full resize-none"
                  :class="{ 'border-red-500 dark:border-red-500': descriptionError }"
                  :disabled="isCreating"
                />
                <p v-if="descriptionError" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {{ descriptionError }}
                </p>
              </div>

              <!-- Image URL -->
              <div class="mb-4">
                <label for="image" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image URL *
                </label>
                <input
                  id="image"
                  v-model="image"
                  type="url"
                  placeholder="https://example.com/image.png"
                  class="input w-full"
                  :class="{ 'border-red-500 dark:border-red-500': imageError }"
                  :disabled="isCreating"
                />
                <p v-if="imageError" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {{ imageError }}
                </p>
                <p v-else class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  URL to collection image (HTTPS recommended)
                </p>
              </div>
            </div>

            <!-- Token Type Section -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Token Type
              </h3>

              <div class="flex gap-3">
                <button
                  type="button"
                  class="flex-1 p-3 border-2 rounded-lg transition-colors"
                  :class="isNonFungible
                    ? 'border-gala-primary bg-gala-primary/10 text-gala-primary'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'"
                  @click="isNonFungible = true"
                >
                  <div class="flex flex-col items-center gap-1">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-sm font-medium">NFT Collection</span>
                    <span class="text-xs opacity-75">Unique items</span>
                  </div>
                </button>
                <button
                  type="button"
                  class="flex-1 p-3 border-2 rounded-lg transition-colors"
                  :class="!isNonFungible
                    ? 'border-gala-primary bg-gala-primary/10 text-gala-primary'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'"
                  @click="isNonFungible = false"
                >
                  <div class="flex flex-col items-center gap-1">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-sm font-medium">Fungible Token</span>
                    <span class="text-xs opacity-75">Divisible units</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Token Key Section -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Token Identifiers
              </h3>

              <div class="grid grid-cols-2 gap-4">
                <!-- Collection -->
                <div>
                  <label for="collection" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Collection *
                  </label>
                  <input
                    id="collection"
                    v-model="collection"
                    type="text"
                    placeholder="my-collection"
                    class="input w-full"
                    :class="{ 'border-red-500 dark:border-red-500': collectionError }"
                    :disabled="isCreating"
                  />
                  <p v-if="collectionError" class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {{ collectionError }}
                  </p>
                </div>

                <!-- Category -->
                <div>
                  <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <input
                    id="category"
                    v-model="category"
                    type="text"
                    placeholder="Item"
                    class="input w-full"
                    :class="{ 'border-red-500 dark:border-red-500': categoryError }"
                    :disabled="isCreating"
                  />
                  <p v-if="categoryError" class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {{ categoryError }}
                  </p>
                </div>

                <!-- Type -->
                <div>
                  <label for="type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type *
                  </label>
                  <input
                    id="type"
                    v-model="type"
                    type="text"
                    placeholder="common"
                    class="input w-full"
                    :class="{ 'border-red-500 dark:border-red-500': typeError }"
                    :disabled="isCreating"
                  />
                  <p v-if="typeError" class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {{ typeError }}
                  </p>
                </div>

                <!-- Additional Key -->
                <div>
                  <label for="additionalKey" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Additional Key
                  </label>
                  <input
                    id="additionalKey"
                    v-model="additionalKey"
                    type="text"
                    placeholder="none"
                    class="input w-full"
                    :class="{ 'border-red-500 dark:border-red-500': additionalKeyError }"
                    :disabled="isCreating"
                  />
                  <p v-if="additionalKeyError" class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {{ additionalKeyError }}
                  </p>
                </div>
              </div>

              <!-- Key Preview -->
              <div class="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm font-mono text-gray-600 dark:text-gray-400 break-all">
                {{ collectionKeyPreview || 'collection|category|type|additionalKey' }}
              </div>
            </div>

            <!-- Advanced Options -->
            <div>
              <button
                type="button"
                class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                @click="showAdvanced = !showAdvanced"
              >
                <svg
                  class="w-4 h-4 transition-transform"
                  :class="{ 'rotate-90': showAdvanced }"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
                Advanced Options
              </button>

              <div v-if="showAdvanced" class="mt-3 space-y-4">
                <!-- Max Supply -->
                <div>
                  <label for="maxSupply" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Supply
                  </label>
                  <input
                    id="maxSupply"
                    v-model="maxSupply"
                    type="text"
                    inputmode="numeric"
                    placeholder="Leave empty for unlimited"
                    class="input w-full"
                    :class="{ 'border-red-500 dark:border-red-500': maxSupplyError }"
                    :disabled="isCreating"
                  />
                  <p v-if="maxSupplyError" class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {{ maxSupplyError }}
                  </p>
                  <p v-else class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Maximum number of tokens that can exist
                  </p>
                </div>

                <!-- Decimals (only for fungible) -->
                <div v-if="!isNonFungible">
                  <label for="decimals" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Decimals
                  </label>
                  <input
                    id="decimals"
                    v-model.number="decimals"
                    type="number"
                    min="0"
                    max="18"
                    class="input w-full"
                    :class="{ 'border-red-500 dark:border-red-500': decimalsError }"
                    :disabled="isCreating"
                  />
                  <p v-if="decimalsError" class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {{ decimalsError }}
                  </p>
                  <p v-else class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Number of decimal places (0-18)
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Confirmation View -->
        <div v-else>
          <div class="space-y-4">
            <!-- Collection Preview -->
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
              <div class="flex items-center gap-3 mb-4">
                <div
                  v-if="image"
                  class="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700"
                >
                  <img :src="image" :alt="name" class="w-full h-full object-cover" />
                </div>
                <div
                  v-else
                  class="w-12 h-12 rounded-lg bg-gradient-to-br from-gala-primary to-gala-secondary flex items-center justify-center text-white font-bold"
                >
                  {{ symbol.slice(0, 2).toUpperCase() }}
                </div>
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white">{{ name }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ symbol }}</p>
                </div>
              </div>

              <div class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">Type</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ isNonFungible ? 'NFT Collection' : 'Fungible Token' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">Token Key</span>
                <span class="text-sm font-mono text-gray-900 dark:text-white truncate max-w-[200px]" :title="collectionKeyPreview">
                  {{ collectionKeyPreview }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">Max Supply</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatMaxSupply(maxSupply) }}
                </span>
              </div>
              <div v-if="!isNonFungible" class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">Decimals</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ decimals }}</span>
              </div>
              <div v-if="description" class="pt-2 border-t border-gray-200 dark:border-gray-700">
                <span class="text-sm text-gray-500 dark:text-gray-400 block mb-1">Description</span>
                <p class="text-sm text-gray-900 dark:text-white">{{ description }}</p>
              </div>
            </div>

            <!-- Info Notice -->
            <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="text-sm text-blue-700 dark:text-blue-300">
                  <p class="font-medium">Creating this collection will:</p>
                  <ul class="list-disc list-inside mt-1 space-y-1">
                    <li>Register the token class on GalaChain</li>
                    <li>Make you the collection authority</li>
                    <li>Allow you to mint tokens from this collection</li>
                  </ul>
                  <p class="mt-2">This action requires signing with your wallet.</p>
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
            :disabled="isCreating"
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
            :disabled="isCreating"
            @click="goBackToForm"
          >
            Back
          </button>
          <button
            type="button"
            class="flex-1 btn-primary flex items-center justify-center gap-2"
            :disabled="isCreating"
            @click="confirmCreate"
          >
            <LoadingSpinner v-if="isCreating" size="sm" />
            <span>{{ isCreating ? 'Creating...' : 'Create Collection' }}</span>
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
