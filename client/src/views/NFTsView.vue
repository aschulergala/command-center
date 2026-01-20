<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useWallet } from '@/composables/useWallet'

const { connected } = useWallet()
</script>

<template>
  <div>
    <PageHeader
      title="NFTs"
      description="View and manage your NFT collection."
    />

    <!-- Content will be implemented in nft-list task -->
    <EmptyState
      v-if="!connected"
      title="Connect Your Wallet"
      description="Connect your wallet to view and manage your NFT collection."
      icon="nfts"
    />
    <div v-else class="card">
      <p class="text-gray-500">NFT list will be implemented in a future iteration.</p>
    </div>
  </div>
</template>
