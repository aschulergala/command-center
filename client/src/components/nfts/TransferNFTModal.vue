<script setup lang="ts">
import { ref, watch } from 'vue';
import type { NftBalance } from '@/stores/nfts';
import BaseModal from '@/components/ui/BaseModal.vue';
import { useTransferNFT } from '@/composables/useTransferNFT';
import { nftTransferSchema } from '@/lib/schemas/nft-transfer.schema';
import type { ZodError } from 'zod';

const props = defineProps<{
  open: boolean;
  nft: NftBalance | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const recipient = ref('');
const selectedInstanceId = ref('');
const fieldErrors = ref<Record<string, string>>({});
const submitting = ref(false);

function resetForm() {
  recipient.value = '';
  selectedInstanceId.value = '';
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

async function handleSubmit() {
  if (!props.nft) return;

  fieldErrors.value = {};

  // Validate with Zod
  const result = nftTransferSchema.safeParse({
    recipient: recipient.value,
    instanceId: selectedInstanceId.value,
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

  const { transfer } = useTransferNFT(props.nft);

  try {
    await transfer(recipient.value, selectedInstanceId.value);
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
    :title="`Transfer ${nft?.collection ?? 'NFT'} ${nft?.type ?? ''}`"
    size="sm"
    @close="emit('close')"
  >
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
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
        <label for="nft-transfer-instance" class="label mb-1">Instance ID</label>
        <select
          id="nft-transfer-instance"
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

      <!-- Recipient -->
      <div>
        <label for="nft-transfer-recipient" class="label mb-1">Recipient Address</label>
        <input
          id="nft-transfer-recipient"
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
