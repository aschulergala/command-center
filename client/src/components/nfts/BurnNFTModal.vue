<script setup lang="ts">
import { ref, watch } from 'vue';
import type { NftBalance } from '@/stores/nfts';
import BaseModal from '@/components/ui/BaseModal.vue';
import { useBurnNFT } from '@/composables/useBurnNFT';

const props = defineProps<{
  open: boolean;
  nft: NftBalance | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const selectedInstanceId = ref('');
const confirmText = ref('');
const step = ref<1 | 2>(1);
const fieldErrors = ref<Record<string, string>>({});
const submitting = ref(false);

function resetForm() {
  selectedInstanceId.value = '';
  confirmText.value = '';
  step.value = 1;
  fieldErrors.value = {};
  submitting.value = false;
}

// Reset form when modal opens; pre-select first instance if available
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    resetForm();
    if (props.nft && props.nft.instanceIds.length > 0) {
      selectedInstanceId.value = props.nft.instanceIds[0];
    }
  }
});

function proceedToConfirm() {
  fieldErrors.value = {};

  if (!selectedInstanceId.value) {
    fieldErrors.value.instanceId = 'Please select an instance to burn.';
    return;
  }

  step.value = 2;
}

async function handleBurn() {
  if (!props.nft) return;

  fieldErrors.value = {};

  if (confirmText.value !== 'BURN') {
    fieldErrors.value.confirmText = 'Type BURN to confirm.';
    return;
  }

  submitting.value = true;

  const { burn } = useBurnNFT(props.nft);

  try {
    await burn(selectedInstanceId.value);
    emit('close');
  } catch {
    // Error is already handled by the composable via toast
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="`Burn ${nft?.collection ?? 'NFT'} ${nft?.type ?? ''}`"
    size="sm"
    @close="emit('close')"
  >
    <!-- Step 1: Select Instance -->
    <div v-if="step === 1" class="flex flex-col gap-4">
      <!-- Warning Banner -->
      <div class="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
        <p class="text-sm font-medium text-red-400">Warning: This action is irreversible</p>
        <p class="mt-0.5 text-xs text-red-400/80">
          Burned NFTs are permanently destroyed and cannot be recovered.
        </p>
      </div>

      <!-- NFT Info -->
      <div class="rounded-lg bg-surface-800 px-3 py-2">
        <p class="text-xs text-surface-400">NFT</p>
        <p class="text-sm font-medium text-white">
          {{ nft?.collection }} - {{ nft?.type }}
        </p>
        <p class="mt-0.5 text-xs text-surface-500">
          {{ nft?.totalOwned }} instance{{ (nft?.totalOwned ?? 0) !== 1 ? 's' : '' }} owned
        </p>
      </div>

      <!-- Instance ID Select -->
      <div>
        <label for="nft-burn-instance" class="label mb-1">Instance to Burn</label>
        <select
          id="nft-burn-instance"
          v-model="selectedInstanceId"
          class="input"
        >
          <option value="" disabled>Select an instance</option>
          <option
            v-for="id in nft?.instanceIds ?? []"
            :key="id"
            :value="id"
          >
            #{{ id }}
          </option>
        </select>
        <p v-if="fieldErrors.instanceId" class="mt-1 text-xs text-red-400">
          {{ fieldErrors.instanceId }}
        </p>
      </div>
    </div>

    <!-- Step 2: Confirmation -->
    <div v-else class="flex flex-col gap-4">
      <!-- Summary -->
      <div class="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-3">
        <p class="text-sm text-red-400">
          You are about to permanently burn
          <span class="font-semibold">{{ nft?.collection }} {{ nft?.type }}</span>
          instance
          <span class="font-mono font-semibold">#{{ selectedInstanceId }}</span>.
          This cannot be undone.
        </p>
      </div>

      <!-- Confirmation Input -->
      <div>
        <label for="nft-burn-confirm" class="label mb-1">
          Type <span class="font-mono font-semibold text-red-400">BURN</span> to confirm
        </label>
        <input
          id="nft-burn-confirm"
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
