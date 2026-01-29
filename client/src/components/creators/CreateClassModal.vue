<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import { useCreateTokenClass } from '@/composables/useCreateTokenClass';
import { tokenClassSchema } from '@/lib/schemas/token-class.schema';
import type { ZodError } from 'zod';

const props = defineProps<{
  open: boolean;
  collection: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const type = ref('');
const category = ref('');
const name = ref('');
const description = ref('');
const maxSupply = ref('');
const fieldErrors = ref<Record<string, string>>({});

const { create, isCreating } = useCreateTokenClass();

function resetForm() {
  type.value = '';
  category.value = '';
  name.value = '';
  description.value = '';
  maxSupply.value = '';
  fieldErrors.value = {};
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

async function handleSubmit() {
  fieldErrors.value = {};

  // Build params
  const params = {
    collection: props.collection,
    type: type.value,
    category: category.value,
    name: name.value || undefined,
    description: description.value || undefined,
    maxSupply: maxSupply.value || undefined,
  };

  // Validate with Zod
  const result = tokenClassSchema.safeParse(params);

  if (!result.success) {
    const zodError = result.error as ZodError;
    for (const issue of zodError.issues) {
      const field = issue.path[0] as string;
      fieldErrors.value[field] = issue.message;
    }
    return;
  }

  try {
    await create(params);
    emit('close');
  } catch {
    // Error is already handled by the composable via toast
  }
}
</script>

<template>
  <BaseModal
    :open="open"
    title="Create Token Class"
    size="md"
    @close="emit('close')"
  >
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <!-- Collection (readonly) -->
      <div>
        <label for="class-collection" class="label mb-1">Collection</label>
        <input
          id="class-collection"
          type="text"
          class="input cursor-not-allowed opacity-60"
          :value="collection"
          readonly
        />
      </div>

      <!-- Type -->
      <div>
        <label for="class-type" class="label mb-1">Type</label>
        <input
          id="class-type"
          v-model="type"
          type="text"
          class="input"
          placeholder="e.g. Weapon, Character, Item"
          autocomplete="off"
        />
        <p v-if="fieldErrors.type" class="mt-1 text-xs text-red-400">
          {{ fieldErrors.type }}
        </p>
      </div>

      <!-- Category -->
      <div>
        <label for="class-category" class="label mb-1">Category</label>
        <input
          id="class-category"
          v-model="category"
          type="text"
          class="input"
          placeholder="e.g. Legendary, Common, Rare"
          autocomplete="off"
        />
        <p v-if="fieldErrors.category" class="mt-1 text-xs text-red-400">
          {{ fieldErrors.category }}
        </p>
      </div>

      <!-- Name (optional) -->
      <div>
        <label for="class-name" class="label mb-1">
          Name
          <span class="text-surface-500">(optional)</span>
        </label>
        <input
          id="class-name"
          v-model="name"
          type="text"
          class="input"
          placeholder="Display name for this token class"
          autocomplete="off"
        />
      </div>

      <!-- Description (optional) -->
      <div>
        <label for="class-description" class="label mb-1">
          Description
          <span class="text-surface-500">(optional)</span>
        </label>
        <textarea
          id="class-description"
          v-model="description"
          class="input min-h-[80px] resize-y"
          placeholder="Describe this token class..."
        />
      </div>

      <!-- Max Supply (optional) -->
      <div>
        <label for="class-max-supply" class="label mb-1">
          Max Supply
          <span class="text-surface-500">(optional)</span>
        </label>
        <input
          id="class-max-supply"
          v-model="maxSupply"
          type="text"
          inputmode="numeric"
          class="input"
          placeholder="Leave empty for unlimited"
          autocomplete="off"
        />
        <p v-if="fieldErrors.maxSupply" class="mt-1 text-xs text-red-400">
          {{ fieldErrors.maxSupply }}
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
          :disabled="isCreating"
          @click="handleSubmit"
        >
          <span v-if="isCreating">Creating...</span>
          <span v-else>Create Token Class</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>
