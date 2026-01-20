<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useWallet } from '@/composables/useWallet'

const { connected } = useWallet()
</script>

<template>
  <div>
    <PageHeader
      title="Creators"
      description="Create and manage your token collections."
    />

    <!-- Content will be implemented in creators-page task -->
    <EmptyState
      v-if="!connected"
      title="Connect Your Wallet"
      description="Connect your wallet to access creator tools and manage your collections."
      icon="collections"
    />
    <div v-else class="card">
      <p class="text-gray-500">Creator tools will be implemented in a future iteration.</p>
    </div>
  </div>
</template>
