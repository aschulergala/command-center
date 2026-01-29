<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue';
import EmptyState from '@/components/ui/EmptyState.vue';

const plannedFeatures = [
  {
    title: 'CSV Export',
    description: 'Download your portfolio as a spreadsheet',
    color: 'bg-gala-500',
  },
  {
    title: 'Transaction History',
    description: 'Export a complete log of all your transactions',
    color: 'bg-amber-500',
  },
  {
    title: 'Tax Reports',
    description: 'Generate tax-ready reports for your crypto activity',
    color: 'bg-green-500',
  },
];
</script>

<template>
  <div class="flex flex-col gap-6">
    <PageHeader
      title="Export"
      description="Export your portfolio data and transaction history"
    />

    <div class="card">
      <EmptyState
        title="Coming Soon"
        description="Portfolio export functionality is under development. You'll be able to export your token balances, NFT holdings, and transaction history."
      />
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="feature in plannedFeatures"
        :key="feature.title"
        class="card flex items-start gap-3 opacity-50"
      >
        <div
          class="mt-0.5 h-3 w-3 shrink-0 rounded-full"
          :class="feature.color"
        />
        <div>
          <h3 class="text-sm font-medium text-white">{{ feature.title }}</h3>
          <p class="mt-1 text-sm text-surface-400">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
