<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'
</script>

<template>
  <div>
    <PageHeader
      title="Export"
      description="Export your wallet activity to CSV format."
    />

    <!-- Coming soon placeholder -->
    <div class="card text-center py-12">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gala-light flex items-center justify-center">
        <svg class="w-8 h-8 text-gala-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
      <p class="text-sm text-gray-500 max-w-md mx-auto mb-6">
        Export your wallet activity including token transfers, NFT transactions, and more.
        Get a clean CSV file for tax reporting or personal records.
      </p>
      <div class="flex flex-wrap justify-center gap-2">
        <span class="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">Date range filters</span>
        <span class="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">FT/NFT selection</span>
        <span class="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">CSV download</span>
      </div>
    </div>
  </div>
</template>
