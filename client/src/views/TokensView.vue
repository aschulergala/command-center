<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useWallet } from '@/composables/useWallet'

const { connected } = useWallet()
</script>

<template>
  <div>
    <PageHeader
      title="Tokens"
      description="View and manage your fungible tokens."
    />

    <!-- Content will be implemented in fungible-tokens-list task -->
    <EmptyState
      v-if="!connected"
      title="Connect Your Wallet"
      description="Connect your wallet to view and manage your fungible tokens."
      icon="tokens"
    />
    <div v-else class="card">
      <p class="text-gray-500">Token list will be implemented in the next iteration.</p>
    </div>
  </div>
</template>
