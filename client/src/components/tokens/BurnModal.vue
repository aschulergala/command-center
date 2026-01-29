<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { TokenBalance } from '@/stores/tokens';
import BaseModal from '@/components/ui/BaseModal.vue';
import { useBurnTokens } from '@/composables/useBurnTokens';
import { burnSchema } from '@/lib/schemas/burn.schema';
import type { ZodError } from 'zod';

const props = defineProps<{
  open: boolean;
  token: TokenBalance | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const amount = ref('');
const confirmText = ref('');
const step = ref<1 | 2>(1);
const fieldErrors = ref<Record<string, string>>({});
const submitting = ref(false);

const tokenId = computed(() => props.token?.tokenId ?? '');
const displayName = computed(() => props.token?.displayName ?? '');

function resetForm() {
  amount.value = '';
  confirmText.value = '';
  step.value = 1;
  fieldErrors.value = {};
  submitting.value = false;
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    resetForm();
  }
});

function proceedToConfirm() {
  fieldErrors.value = {};

  if (!amount.value || isNaN(Number(amount.value)) || Number(amount.value) <= 0) {
    fieldErrors.value.amount = 'Must be a positive number.';
    return;
  }

  if (props.token && Number(amount.value) > Number(props.token.availableQuantity)) {
    fieldErrors.value.amount = 'Amount exceeds available balance.';
    return;
  }

  step.value = 2;
}

async function handleBurn() {
  if (!props.token) return;

  fieldErrors.value = {};

  const result = burnSchema.safeParse({
    amount: amount.value,
    confirmText: confirmText.value,
  });

  if (!result.success) {
    const zodError = result.error as ZodError;
    for (const issue of zodError.issues) {
      const field = issue.path[0] as string;
      fieldErrors.value[field] = issue.message;
    }
    return;
  }

  submitting.value = true;

  const { burn } = useBurnTokens(tokenId.value, displayName.value);

  try {
    await burn(amount.value);
    emit('close');
  } catch {
    // Error is already handled by the composable via toast
  } finally {
    submitting.value = false;
  }
}

function setMaxAmount() {
  if (props.token) {
    amount.value = props.token.availableQuantity;
  }
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="`Burn ${token?.displayName ?? 'Token'}`"
    size="sm"
    @close="emit('close')"
  >
    <!-- Step 1: Amount Input -->
    <div v-if="step === 1" class="flex flex-col gap-4">
      <!-- Warning Banner -->
      <div class="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
        <p class="text-sm font-medium text-red-400">Warning: This action is irreversible</p>
        <p class="mt-0.5 text-xs text-red-400/80">
          Burned tokens are permanently destroyed and cannot be recovered.
        </p>
      </div>

      <!-- Available Balance Info -->
      <div class="rounded-lg bg-surface-800 px-3 py-2">
        <p class="text-xs text-surface-400">Available Balance</p>
        <p class="font-mono text-sm font-medium text-white">
          {{ token?.availableQuantity ?? '0' }} {{ token?.displayName }}
        </p>
      </div>

      <!-- Amount -->
      <div>
        <label for="burn-amount" class="label mb-1">Amount to Burn</label>
        <div class="relative">
          <input
            id="burn-amount"
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
    </div>

    <!-- Step 2: Confirmation -->
    <div v-else class="flex flex-col gap-4">
      <!-- Summary -->
      <div class="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-3">
        <p class="text-sm text-red-400">
          You are about to permanently burn
          <span class="font-mono font-semibold">{{ amount }}</span>
          <span class="font-semibold">{{ token?.displayName }}</span>.
          This cannot be undone.
        </p>
      </div>

      <!-- Confirmation Input -->
      <div>
        <label for="burn-confirm" class="label mb-1">
          Type <span class="font-mono font-semibold text-red-400">BURN</span> to confirm
        </label>
        <input
          id="burn-confirm"
          v-model="confirmText"
          type="text"
          class="input"
          placeholder="BURN"
          autocomplete="off"
        />
        <p v-if="fieldErrors.confirmText" class="mt-1 text-xs text-red-400">
          {{ fieldErrors.confirmText }}
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          v-if="step === 2"
          type="button"
          class="btn-secondary"
          @click="step = 1"
        >
          Back
        </button>
        <button
          type="button"
          class="btn-secondary"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          v-if="step === 1"
          type="button"
          class="btn-danger"
          @click="proceedToConfirm"
        >
          Continue
        </button>
        <button
          v-else
          type="button"
          class="btn-danger"
          :disabled="submitting || confirmText !== 'BURN'"
          @click="handleBurn"
        >
          <span v-if="submitting">Burning...</span>
          <span v-else>Confirm Burn</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>
