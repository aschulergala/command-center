<script setup lang="ts">
import type { TokenBalance } from '@/stores/tokens';
import TokenCard from '@/components/tokens/TokenCard.vue';
import TokenCardSkeleton from '@/components/tokens/TokenCardSkeleton.vue';
import EmptyState from '@/components/ui/EmptyState.vue';

defineProps<{
  tokens: TokenBalance[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  transfer: [token: TokenBalance];
  burn: [token: TokenBalance];
  lock: [token: TokenBalance];
  unlock: [token: TokenBalance];
}>();
</script>

<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <TokenCardSkeleton v-for="i in 6" :key="i" />
  </div>

  <!-- Empty State -->
  <EmptyState
    v-else-if="tokens.length === 0"
    title="No tokens found"
    description="Connect your wallet to view your token balances."
  />

  <!-- Token Cards -->
  <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <TokenCard
      v-for="token in tokens"
      :key="token.tokenId"
      :token="token"
      @transfer="emit('transfer', $event)"
      @burn="emit('burn', $event)"
      @lock="emit('lock', $event)"
      @unlock="emit('unlock', $event)"
    />
  </div>
</template>
