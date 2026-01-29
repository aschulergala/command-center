<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { TokenBalance } from '@/stores/tokens';
import BaseModal from '@/components/ui/BaseModal.vue';
import { useLockTokens } from '@/composables/useLockTokens';
import { lockSchema } from '@/lib/schemas/lock.schema';
import type { ZodError } from 'zod';

const props = defineProps<{
  open: boolean;
  token: TokenBalance | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const amount = ref('');
const fieldErrors = ref<Record<string, string>>({});
const submitting = ref(false);

const tokenId = computed(() => props.token?.tokenId ?? '');
const displayName = computed(() => props.token?.displayName ?? '');

function resetForm() {
  amount.value = '';
  fieldErrors.value = {};
  submitting.value = false;
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    resetForm();
  }
});

async function handleSubmit() {
  if (!props.token) return;

  fieldErrors.value = {};

  const result = lockSchema.safeParse({ amount: amount.value });

  if (!result.success) {
    const zodError = result.error as ZodError;
    for (const issue of zodError.issues) {
      const field = issue.path[0] as string;
      fieldErrors.value[field] = issue.message;
    }
    return;
  }

  if (Number(amount.value) > Number(props.token.lockedQuantity)) {
    fieldErrors.value.amount = 'Amount exceeds locked balance.';
    return;
  }

  submitting.value = true;

  const { unlock } = useLockTokens(tokenId.value, displayName.value);

  try {
    await unlock(amount.value);
    emit('close');
  } catch {
    // Error is already handled by the composable via toast
  } finally {
    submitting.value = false;
  }
}

function setMaxAmount() {
  if (props.token) {
    amount.value = props.token.lockedQuantity;
  }
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="`Unlock ${token?.displayName ?? 'Token'}`"
    size="sm"
    @close="emit('close')"
  >
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <!-- Locked Balance Info -->
      <div class="rounded-lg bg-surface-800 px-3 py-2">
        <p class="text-xs text-surface-400">Locked Balance</p>
        <p class="font-mono text-sm font-medium text-amber-400">
          {{ token?.lockedQuantity ?? '0' }} {{ token?.displayName }}
        </p>
      </div>

      <!-- Amount -->
      <div>
        <label for="unlock-amount" class="label mb-1">Amount to Unlock</label>
        <div class="relative">
          <input
            id="unlock-amount"
            v-model="amount"
            type="text"
            inputmode="decimal"
            class="input pr-14"
            placeholder="0.00"
            autocomplete="off"
          />
          <button
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-surface-700 px-2 py-0.5 text-xs font-medium text-surface-300 hover:bg-surface-600 hover:text-white"
            @click="setMaxAmount"
          >
            MAX
          </button>
        </div>
        <p v-if="fieldErrors.amount" class="mt-1 text-xs text-red-400">
          {{ fieldErrors.amount }}
        </p>
      </div>

      <p class="text-xs text-surface-500">
        Unlocked tokens will become available for transfer, burn, and other operations.
      </p>
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
          :disabled="submitting"
          @click="handleSubmit"
        >
          <span v-if="submitting">Unlocking...</span>
          <span v-else>Unlock Tokens</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>
