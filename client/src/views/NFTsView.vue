<script setup lang="ts">
import { ref } from 'vue';
import { useNftStore, type NftBalance } from '@/stores/nfts';
import { useWalletEffect } from '@/composables/useWalletEffect';
import PageHeader from '@/components/ui/PageHeader.vue';
import ErrorDisplay from '@/components/ui/ErrorDisplay.vue';
import CollectionFilter from '@/components/nfts/CollectionFilter.vue';
import NFTGrid from '@/components/nfts/NFTGrid.vue';
import TransferNFTModal from '@/components/nfts/TransferNFTModal.vue';
import BurnNFTModal from '@/components/nfts/BurnNFTModal.vue';

const nftStore = useNftStore();

useWalletEffect(
  () => nftStore.fetchBalances(),
  () => nftStore.reset(),
);

// Modal state
type ModalType = 'transfer' | 'burn' | null;
const activeModal = ref<ModalType>(null);
const selectedNft = ref<NftBalance | null>(null);

function openModal(type: ModalType, nft: NftBalance) {
  selectedNft.value = nft;
  activeModal.value = type;
}

function closeModal() {
  activeModal.value = null;
  selectedNft.value = null;
}

</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <PageHeader
      title="NFTs"
      description="Manage your non-fungible token collection"
    />

    <!-- Collection Filter -->
    <CollectionFilter
      :collections="nftStore.collections"
      :model-value="nftStore.selectedCollection"
      @update:model-value="nftStore.setCollectionFilter"
    />

    <!-- Error Display -->
    <ErrorDisplay
      v-if="nftStore.error"
      :message="nftStore.error"
      @retry="nftStore.fetchBalances()"
    />

    <!-- NFT Grid -->
    <NFTGrid
      :nfts="nftStore.filteredBalances"
      :is-loading="nftStore.isLoading"
      @transfer="openModal('transfer', $event)"
      @burn="openModal('burn', $event)"
    />

    <!-- Modals -->
    <TransferNFTModal
      :open="activeModal === 'transfer'"
      :nft="selectedNft"
      @close="closeModal"
    />
    <BurnNFTModal
      :open="activeModal === 'burn'"
      :nft="selectedNft"
      @close="closeModal"
    />
  </div>
</template>
