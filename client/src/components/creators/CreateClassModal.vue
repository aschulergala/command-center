<script setup lang="ts">
/**
 * CreateClassModal.vue
 * Modal dialog for creating a new token class within a collection
 */
import { ref, computed, watch, nextTick } from 'vue'
import { useForm } from 'vee-validate'
import {
  getCreateClassTypedSchema,
  generateClassKey,
  formatMaxSupply,
  type CreateClassFormValues,
} from '@/lib/schemas/createClassSchema'
import { useManageClasses, type CreateClassInput } from '@/composables/useManageClasses'
import type { CreatorCollectionDisplay } from '@/stores/creatorCollections'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const props = defineProps<{
  open: boolean
  collection: CreatorCollectionDisplay | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success', classKey: string): void
}>()

// Form state
const dialogRef = ref<HTMLDialogElement | null>(null)
const step = ref<'form' | 'confirm'>('form')

// Composable
const { isCreating, error, createClass, clearError } = useManageClasses()

// Form setup
const { handleSubmit, resetForm, errors, defineField, meta } = useForm<CreateClassFormValues>({
  validationSchema: getCreateClassTypedSchema(),
  initialValues: {
    name: '',
    additionalKey: '',
    description: '',
    image: '',
    maxSupply: '',
    rarity: '',
  },
})

// Define form fields
const [name, nameAttrs] = defineField('name')
const [additionalKey, additionalKeyAttrs] = defineField('additionalKey')
const [description, descriptionAttrs] = defineField('description')
const [image, imageAttrs] = defineField('image')
const [maxSupply, maxSupplyAttrs] = defineField('maxSupply')
const [rarity, rarityAttrs] = defineField('rarity')

// Computed
const classKeyPreview = computed(() => {
  if (!props.collection || !additionalKey.value) return ''
  return generateClassKey(
    props.collection.collection,
    props.collection.category,
    props.collection.type,
    additionalKey.value
  )
})

const canContinue = computed(() => {
  return meta.value.valid && name.value && additionalKey.value
})

// Watch for open changes
watch(() => props.open, (newOpen) => {
  nextTick(() => {
    if (newOpen && dialogRef.value) {
      dialogRef.value.showModal()
    } else if (!newOpen && dialogRef.value) {
      dialogRef.value.close()
    }
  })
})

// Handle dialog close via escape or backdrop
function handleDialogClose() {
  emit('close')
}

/**
 * Handle dialog click (close on backdrop)
 */
function handleDialogClick(e: MouseEvent) {
  if (e.target === dialogRef.value) {
    handleClose()
  }
}

/**
 * Close the modal and reset state
 */
function handleClose() {
  step.value = 'form'
  resetForm()
  clearError()
  emit('close')
}

/**
 * Move to confirmation step
 */
const handleContinue = handleSubmit(() => {
  step.value = 'confirm'
})

/**
 * Go back to form step
 */
function handleBack() {
  step.value = 'form'
  clearError()
}

/**
 * Submit the class creation
 */
async function handleCreate() {
  if (!props.collection) return

  const input: CreateClassInput = {
    collection: props.collection.collection,
    category: props.collection.category,
    type: props.collection.type,
    additionalKey: additionalKey.value,
    name: name.value,
    description: description.value || '',
    image: image.value || '',
    maxSupply: maxSupply.value || '',
    rarity: rarity.value || '',
  }

  const result = await createClass(input)

  if (result.success && result.classKey) {
    emit('success', result.classKey)
    handleClose()
  }
}
</script>

<template>
  <dialog
    ref="dialogRef"
    class="modal-dialog"
    @close="handleDialogClose"
    @click="handleDialogClick"
  >
    <div class="modal-content max-w-md" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">Create Token Class</h2>
          <p v-if="collection" class="text-sm text-gray-500 mt-1">
            in {{ collection.name }}
          </p>
        </div>
        <button
          class="modal-close"
          type="button"
          @click="handleClose"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form Step -->
      <form v-if="step === 'form'" @submit.prevent="handleContinue">
        <div class="modal-body space-y-4">
          <!-- Class Name -->
          <div>
            <label for="className" class="block text-sm font-medium text-gray-700 mb-1">
              Class Name <span class="text-red-500">*</span>
            </label>
            <input
              id="className"
              v-model="name"
              v-bind="nameAttrs"
              type="text"
              class="input w-full"
              :class="{ 'input-error': errors.name }"
              placeholder="e.g., Legendary Sword"
            />
            <p v-if="errors.name" class="text-sm text-red-500 mt-1">{{ errors.name }}</p>
          </div>

          <!-- Additional Key (Class Identifier) -->
          <div>
            <label for="additionalKey" class="block text-sm font-medium text-gray-700 mb-1">
              Class Identifier <span class="text-red-500">*</span>
            </label>
            <input
              id="additionalKey"
              v-model="additionalKey"
              v-bind="additionalKeyAttrs"
              type="text"
              class="input w-full"
              :class="{ 'input-error': errors.additionalKey }"
              placeholder="e.g., legendarysword"
            />
            <p v-if="errors.additionalKey" class="text-sm text-red-500 mt-1">{{ errors.additionalKey }}</p>
            <p class="text-xs text-gray-500 mt-1">Alphanumeric identifier (no spaces)</p>
          </div>

          <!-- Class Key Preview -->
          <div v-if="classKeyPreview" class="p-3 bg-gray-50 rounded-lg">
            <p class="text-xs text-gray-500 mb-1">Full Class Key</p>
            <p class="text-sm font-mono text-gray-700 break-all">{{ classKeyPreview }}</p>
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              v-model="description"
              v-bind="descriptionAttrs"
              rows="3"
              class="input w-full resize-none"
              :class="{ 'input-error': errors.description }"
              placeholder="Describe this token class..."
            ></textarea>
            <p v-if="errors.description" class="text-sm text-red-500 mt-1">{{ errors.description }}</p>
          </div>

          <!-- Image URL -->
          <div>
            <label for="image" class="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              id="image"
              v-model="image"
              v-bind="imageAttrs"
              type="url"
              class="input w-full"
              :class="{ 'input-error': errors.image }"
              placeholder="https://example.com/image.png"
            />
            <p v-if="errors.image" class="text-sm text-red-500 mt-1">{{ errors.image }}</p>
          </div>

          <!-- Max Supply -->
          <div>
            <label for="maxSupply" class="block text-sm font-medium text-gray-700 mb-1">
              Max Supply
            </label>
            <input
              id="maxSupply"
              v-model="maxSupply"
              v-bind="maxSupplyAttrs"
              type="text"
              class="input w-full"
              :class="{ 'input-error': errors.maxSupply }"
              placeholder="Leave empty for unlimited"
            />
            <p v-if="errors.maxSupply" class="text-sm text-red-500 mt-1">{{ errors.maxSupply }}</p>
            <p class="text-xs text-gray-500 mt-1">Maximum number that can ever be minted</p>
          </div>

          <!-- Rarity -->
          <div>
            <label for="rarity" class="block text-sm font-medium text-gray-700 mb-1">
              Rarity
            </label>
            <input
              id="rarity"
              v-model="rarity"
              v-bind="rarityAttrs"
              type="text"
              class="input w-full"
              :class="{ 'input-error': errors.rarity }"
              placeholder="e.g., Legendary, Rare, Common"
            />
            <p v-if="errors.rarity" class="text-sm text-red-500 mt-1">{{ errors.rarity }}</p>
          </div>
        </div>

        <!-- Form Footer -->
        <div class="modal-footer">
          <button
            type="button"
            class="btn-secondary"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="!canContinue"
          >
            Continue
          </button>
        </div>
      </form>

      <!-- Confirmation Step -->
      <div v-else-if="step === 'confirm'">
        <div class="modal-body">
          <!-- Class Preview -->
          <div class="p-4 bg-purple-50 rounded-lg border border-purple-100 mb-4">
            <div class="flex items-start gap-3">
              <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <span class="text-white text-sm font-bold">
                  {{ name.slice(0, 2).toUpperCase() }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900">{{ name }}</h3>
                <p class="text-sm text-gray-500">{{ classKeyPreview }}</p>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Collection</span>
              <span class="font-medium text-gray-900">{{ collection?.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Class Name</span>
              <span class="font-medium text-gray-900">{{ name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Identifier</span>
              <span class="font-mono text-gray-900">{{ additionalKey }}</span>
            </div>
            <div v-if="description" class="flex justify-between">
              <span class="text-gray-500">Description</span>
              <span class="font-medium text-gray-900 text-right max-w-[200px] truncate">{{ description }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Max Supply</span>
              <span class="font-medium text-gray-900">{{ formatMaxSupply(maxSupply) }}</span>
            </div>
            <div v-if="rarity" class="flex justify-between">
              <span class="text-gray-500">Rarity</span>
              <span class="font-medium text-gray-900">{{ rarity }}</span>
            </div>
          </div>

          <!-- Info Notice -->
          <div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div class="flex gap-2">
              <svg class="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-blue-700">
                Creating a class defines a new token type within your collection. You'll be able to mint NFTs of this class.
              </p>
            </div>
          </div>

          <!-- Error Display -->
          <div v-if="error" class="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <div class="flex gap-2">
              <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Confirm Footer -->
        <div class="modal-footer">
          <button
            type="button"
            class="btn-secondary"
            :disabled="isCreating"
            @click="handleBack"
          >
            Back
          </button>
          <button
            type="button"
            class="btn-primary"
            :disabled="isCreating"
            @click="handleCreate"
          >
            <LoadingSpinner v-if="isCreating" size="sm" class="mr-2" />
            {{ isCreating ? 'Creating...' : 'Create Class' }}
          </button>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.modal-dialog {
  @apply fixed inset-0 z-50 m-0 p-0 w-full max-w-full h-full max-h-full bg-transparent;
}

.modal-dialog::backdrop {
  @apply bg-black/50;
}

.modal-dialog[open] {
  @apply flex items-center justify-center;
}

.modal-content {
  @apply bg-white rounded-xl shadow-xl w-full mx-4;
}

.modal-header {
  @apply flex items-start justify-between p-4 border-b border-gray-100;
}

.modal-close {
  @apply p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors;
}

.modal-body {
  @apply p-4 max-h-[60vh] overflow-y-auto;
}

.modal-footer {
  @apply flex items-center justify-end gap-3 p-4 border-t border-gray-100;
}

.input-error {
  @apply border-red-300 focus:border-red-500 focus:ring-red-500;
}
</style>
