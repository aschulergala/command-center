<script setup lang="ts">
import type { NftBalance } from '@/stores/nfts';
import NFTCard from '@/components/nfts/NFTCard.vue';
import NFTCardSkeleton from '@/components/nfts/NFTCardSkeleton.vue';
import EmptyState from '@/components/ui/EmptyState.vue';

defineProps<{
  nfts: NftBalance[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  transfer: [nft: NftBalance];
  burn: [nft: NftBalance];
}>();
</script>

<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <NFTCardSkeleton v-for="i in 6" :key="i" />
  </div>

  <!-- Empty State -->
  <EmptyState
    v-else-if="nfts.length === 0"
    title="No NFTs found"
    description="Connect your wallet to view your NFT collection, or try a different collection filter."
  />

  <!-- NFT Cards -->
  <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <NFTCard
      v-for="nft in nfts"
      :key="`${nft.collection}|${nft.category}|${nft.type}|${nft.additionalKey}`"
      :nft="nft"
      @transfer="emit('transfer', $event)"
      @burn="emit('burn', $event)"
    />
  </div>
</template>
