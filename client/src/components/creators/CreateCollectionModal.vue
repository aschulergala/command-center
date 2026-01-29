<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import { useClaimCollection } from '@/composables/useClaimCollection';
import { collectionSchema } from '@/lib/schemas/collection.schema';
import type { ZodError } from 'zod';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const collectionName = ref('');
const fieldErrors = ref<Record<string, string>>({});

const { isClaiming, isChecking, isAvailable, checkAvailability, claim, resetAvailability } =
  useClaimCollection();

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function resetForm() {
  collectionName.value = '';
  fieldErrors.value = {};
  resetAvailability();
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

// Reset form when modal opens/closes
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetForm();
    }
  },
);

// Debounced availability check
watch(collectionName, (name) => {
  fieldErrors.value = {};
  resetAvailability();

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  if (name.length >= 3) {
    debounceTimer = setTimeout(() => {
      checkAvailability(name);
    }, 500);
  }
});

async function handleSubmit() {
  fieldErrors.value = {};

  // Validate with Zod
  const result = collectionSchema.safeParse({
    collectionName: collectionName.value,
  });

  if (!result.success) {
    const zodError = result.error as ZodError;
    for (const issue of zodError.issues) {
      const field = issue.path[0] as string;
      fieldErrors.value[field] = issue.message;
    }
    return;
  }

  if (isAvailable.value === false) {
    fieldErrors.value.collectionName = 'This collection name is already taken.';
    return;
  }

  try {
    await claim(collectionName.value);
    emit('close');
  } catch {
    // Error is already handled by the composable via toast
  }
}
</script>

<template>
  <BaseModal
    :open="open"
    title="Claim Collection"
    size="sm"
    @close="emit('close')"
  >
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <!-- Fee Warning -->
      <div class="rounded-lg border border-amber-900/50 bg-amber-950/50 px-3 py-2.5">
        <div class="flex items-start gap-2">
          <svg
            class="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clip-rule="evenodd"
            />
          </svg>
          <p class="text-sm text-amber-300">
            Claiming a collection requires a fee of <strong>10,000 GALA</strong>.
          </p>
        </div>
      </div>

      <!-- Collection Name -->
      <div>
        <label for="collection-name" class="label mb-1">Collection Name</label>
        <div class="relative">
          <input
            id="collection-name"
            v-model="collectionName"
            type="text"
            class="input pr-10"
            placeholder="MyCollection"
            autocomplete="off"
          />
          <!-- Availability indicator -->
          <div class="absolute right-3 top-1/2 -translate-y-1/2">
            <!-- Checking spinner -->
            <svg
              v-if="isChecking"
              class="h-4 w-4 animate-spin text-surface-400"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                class="opacity-25"
              />
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                class="opacity-75"
              />
            </svg>
            <!-- Available check -->
            <svg
              v-else-if="isAvailable === true"
              class="h-4 w-4 text-green-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <!-- Taken X -->
            <svg
              v-else-if="isAvailable === false"
              class="h-4 w-4 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
        <p v-if="isAvailable === true" class="mt-1 text-xs text-green-400">
          This collection name is available.
        </p>
        <p v-else-if="isAvailable === false" class="mt-1 text-xs text-red-400">
          This collection name is already taken.
        </p>
        <p v-if="fieldErrors.collectionName" class="mt-1 text-xs text-red-400">
          {{ fieldErrors.collectionName }}
        </p>
        <p class="mt-1 text-xs text-surface-500">
          3-50 characters, alphanumeric only.
        </p>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="btn-secondary"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn-primary"
          :disabled="isClaiming || isChecking || isAvailable === false || !collectionName"
          @click="handleSubmit"
        >
          <span v-if="isClaiming">Claiming...</span>
          <span v-else>Claim Collection</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>
