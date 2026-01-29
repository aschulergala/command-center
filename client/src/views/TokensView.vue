<script setup lang="ts">
import { ref } from 'vue';
import { useTokenStore, type TokenBalance } from '@/stores/tokens';
import { useWalletEffect } from '@/composables/useWalletEffect';
import PageHeader from '@/components/ui/PageHeader.vue';
import ErrorDisplay from '@/components/ui/ErrorDisplay.vue';
import TokenList from '@/components/tokens/TokenList.vue';
import SortDropdown from '@/components/tokens/SortDropdown.vue';
import TransferModal from '@/components/tokens/TransferModal.vue';
import BurnModal from '@/components/tokens/BurnModal.vue';
import LockModal from '@/components/tokens/LockModal.vue';
import UnlockModal from '@/components/tokens/UnlockModal.vue';

const tokenStore = useTokenStore();

useWalletEffect(
  () => tokenStore.fetchBalances(),
  () => tokenStore.reset(),
);

// Modal state
type ModalType = 'transfer' | 'burn' | 'lock' | 'unlock' | null;
const activeModal = ref<ModalType>(null);
const selectedToken = ref<TokenBalance | null>(null);

function openModal(type: ModalType, token: TokenBalance) {
  selectedToken.value = token;
  activeModal.value = type;
}

function closeModal() {
  activeModal.value = null;
  selectedToken.value = null;
}

</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header with Sort -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <PageHeader
        title="Tokens"
        description="Manage your fungible token balances"
      />
      <SortDropdown
        v-if="tokenStore.balances.length > 0"
        :model-value="tokenStore.sortBy"
        @update:model-value="tokenStore.setSortBy"
      />
    </div>

    <!-- Error Display -->
    <ErrorDisplay
      v-if="tokenStore.error"
      :message="tokenStore.error"
      @retry="tokenStore.fetchBalances()"
    />

    <!-- Token List -->
    <TokenList
      :tokens="tokenStore.sortedBalances"
      :is-loading="tokenStore.isLoading"
      @transfer="openModal('transfer', $event)"
      @burn="openModal('burn', $event)"
      @lock="openModal('lock', $event)"
      @unlock="openModal('unlock', $event)"
    />

    <!-- Modals -->
    <TransferModal
      :open="activeModal === 'transfer'"
      :token="selectedToken"
      @close="closeModal"
    />
    <BurnModal
      :open="activeModal === 'burn'"
      :token="selectedToken"
      @close="closeModal"
    />
    <LockModal
      :open="activeModal === 'lock'"
      :token="selectedToken"
      @close="closeModal"
    />
    <UnlockModal
      :open="activeModal === 'unlock'"
      :token="selectedToken"
      @close="closeModal"
    />
  </div>
</template>
