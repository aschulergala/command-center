<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { NftTokenClassWithSupply } from '@/stores/creators';
import { useWalletStore } from '@/stores/wallet';
import BaseModal from '@/components/ui/BaseModal.vue';
import { useCollectionMint } from '@/composables/useCollectionMint';
import { collectionMintSchema } from '@/lib/schemas/collection-mint.schema';
import type { ZodError } from 'zod';

const props = defineProps<{
  open: boolean;
  tokenClass: NftTokenClassWithSupply | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const walletStore = useWalletStore();

const quantity = ref('');
const ownerAddress = ref('');
const fieldErrors = ref<Record<string, string>>({});

const { isMinting, mintFee, isEstimating, estimateFee, mint, resetFee } = useCollectionMint();

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const displayName = computed(() => {
  if (!props.tokenClass) return 'NFT';
  return props.tokenClass.name || props.tokenClass.type;
});

const supplyDisplay = computed(() => {
  if (!props.tokenClass) return null;
  const current = props.tokenClass.totalSupply || '0';
  const max = props.tokenClass.maxSupply;
  return max ? `${current} / ${max}` : current;
});

function resetForm() {
  quantity.value = '';
  ownerAddress.value = walletStore.galaAddress ?? '';
  fieldErrors.value = {};
  resetFee();
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

// Debounced fee estimation when quantity changes
watch(quantity, (qty) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  if (!props.tokenClass || !qty || isNaN(Number(qty)) || Number(qty) <= 0) {
    resetFee();
    return;
  }

  debounceTimer = setTimeout(() => {
    if (!props.tokenClass) return;
    estimateFee({
      collection: props.tokenClass.collection,
      type: props.tokenClass.type,
      category: props.tokenClass.category,
      quantity: qty,
      ownerAddress: ownerAddress.value || walletStore.galaAddress || '',
    });
  }, 500);
});

async function handleSubmit() {
  if (!props.tokenClass) return;

  fieldErrors.value = {};

  // Validate with Zod
  const result = collectionMintSchema.safeParse({
    quantity: quantity.value,
    ownerAddress: ownerAddress.value,
  });

  if (!result.success) {
    const zodError = result.error as ZodError;
    for (const issue of zodError.issues) {
      const field = issue.path[0] as string;
      fieldErrors.value[field] = issue.message;
    }
    return;
  }

  // Check against max supply if defined
  if (props.tokenClass.maxSupply) {
    const currentSupply = Number(props.tokenClass.totalSupply || '0');
    const requestedQty = Number(quantity.value);
    const maxSupply = Number(props.tokenClass.maxSupply);

    if (currentSupply + requestedQty > maxSupply) {
      fieldErrors.value.quantity = `Cannot mint more than ${maxSupply - currentSupply} (remaining supply).`;
      return;
    }
  }

  try {
    await mint({
      collection: props.tokenClass.collection,
      type: props.tokenClass.type,
      category: props.tokenClass.category,
      quantity: quantity.value,
      ownerAddress: ownerAddress.value,
      additionalKey: props.tokenClass.additionalKey,
    });
    emit('close');
  } catch {
    // Error is already handled by the composable via toast
  }
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="`Mint ${displayName}`"
    size="sm"
    @close="emit('close')"
  >
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <!-- Supply Info -->
      <div v-if="tokenClass" class="rounded-lg bg-surface-800 px-3 py-2">
        <div class="flex items-center justify-between">
          <p class="text-xs text-surface-400">Current Supply</p>
          <p class="font-mono text-sm font-medium text-white">{{ supplyDisplay }}</p>
        </div>
        <div class="mt-1 flex items-center justify-between">
          <p class="text-xs text-surface-400">Token Class</p>
          <p class="text-sm text-surface-300">
            {{ tokenClass.type }} / {{ tokenClass.category }}
          </p>
        </div>
      </div>

      <!-- Quantity -->
      <div>
        <label for="mint-quantity" class="label mb-1">Quantity</label>
        <input
          id="mint-quantity"
          v-model="quantity"
          type="text"
          inputmode="numeric"
          class="input"
          placeholder="Number of NFTs to mint"
          autocomplete="off"
        />
        <p v-if="fieldErrors.quantity" class="mt-1 text-xs text-red-400">
          {{ fieldErrors.quantity }}
        </p>
      </div>

      <!-- Owner Address -->
      <div>
        <label for="mint-owner" class="label mb-1">Owner Address</label>
        <input
          id="mint-owner"
          v-model="ownerAddress"
          type="text"
          class="input"
          placeholder="0x... or eth|..."
          autocomplete="off"
        />
        <p v-if="fieldErrors.ownerAddress" class="mt-1 text-xs text-red-400">
          {{ fieldErrors.ownerAddress }}
        </p>
      </div>

      <!-- Estimated Fee -->
      <div v-if="mintFee || isEstimating" class="rounded-lg bg-surface-800 px-3 py-2">
        <div class="flex items-center justify-between">
          <p class="text-xs text-surface-400">Estimated Fee</p>
          <div v-if="isEstimating" class="flex items-center gap-1.5">
            <svg
              class="h-3 w-3 animate-spin text-surface-400"
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
            <span class="text-xs text-surface-400">Estimating...</span>
          </div>
          <p v-else class="font-mono text-sm font-medium text-amber-400">
            {{ mintFee }} GALA
          </p>
        </div>
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
          :disabled="isMinting || !quantity"
          @click="handleSubmit"
        >
          <span v-if="isMinting">Minting...</span>
          <span v-else>Mint NFTs</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>
