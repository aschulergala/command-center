<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { TokenBalance } from '@/stores/tokens';
import BaseModal from '@/components/ui/BaseModal.vue';
import { useTransferToken } from '@/composables/useTransferToken';
import { transferSchema } from '@/lib/schemas/transfer.schema';
import type { ZodError } from 'zod';

const props = defineProps<{
  open: boolean;
  token: TokenBalance | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const recipient = ref('');
const amount = ref('');
const fieldErrors = ref<Record<string, string>>({});

const tokenId = computed(() => props.token?.tokenId ?? '');
const displayName = computed(() => props.token?.displayName ?? '');

function resetForm() {
  recipient.value = '';
  amount.value = '';
  fieldErrors.value = {};
}

// Reset form when modal opens/closes
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    resetForm();
  }
});

async function handleSubmit() {
  if (!props.token) return;

  fieldErrors.value = {};

  // Validate with Zod
  const result = transferSchema.safeParse({
    recipient: recipient.value,
    amount: amount.value,
  });

  if (!result.success) {
    const zodError = result.error as ZodError;
    for (const issue of zodError.issues) {
      const field = issue.path[0] as string;
      fieldErrors.value[field] = issue.message;
    }
    return;
  }

  // Validate amount does not exceed available balance
  if (Number(amount.value) > Number(props.token.availableQuantity)) {
    fieldErrors.value.amount = 'Amount exceeds available balance.';
    return;
  }

  const { transfer, isTransferring } = useTransferToken(tokenId.value, displayName.value);

  try {
    await transfer(recipient.value, amount.value);
    emit('close');
  } catch {
    // Error is already handled by the composable via toast
  }

  // Expose isTransferring for the template reactivity (re-assigned below)
  submitting.value = isTransferring.value;
}

const submitting = ref(false);

function setMaxAmount() {
  if (props.token) {
    amount.value = props.token.availableQuantity;
  }
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="`Transfer ${token?.displayName ?? 'Token'}`"
    size="sm"
    @close="emit('close')"
  >
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <!-- Available Balance Info -->
      <div class="rounded-lg bg-surface-800 px-3 py-2">
        <p class="text-xs text-surface-400">Available Balance</p>
        <p class="font-mono text-sm font-medium text-white">
          {{ token?.availableQuantity ?? '0' }} {{ token?.displayName }}
        </p>
      </div>

      <!-- Recipient -->
      <div>
        <label for="transfer-recipient" class="label mb-1">Recipient Address</label>
        <input
          id="transfer-recipient"
          v-model="recipient"
          type="text"
          class="input"
          placeholder="0x... or eth|..."
          autocomplete="off"
        />
        <p v-if="fieldErrors.recipient" class="mt-1 text-xs text-red-400">
          {{ fieldErrors.recipient }}
        </p>
      </div>

      <!-- Amount -->
      <div>
        <label for="transfer-amount" class="label mb-1">Amount</label>
        <div class="relative">
          <input
            id="transfer-amount"
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
          <span v-if="submitting">Transferring...</span>
          <span v-else>Transfer</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>
