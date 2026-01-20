<script setup lang="ts">
/**
 * CreatorsView.vue
 * Main creators page with Pump Interface and NFT Collection Tools sections
 */
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PumpEntry from '@/components/creators/PumpEntry.vue'
import { useWallet } from '@/composables/useWallet'

const { connected } = useWallet()
</script>

<template>
  <div>
    <PageHeader
      title="Creators"
      description="Create and manage your token collections."
    />

    <!-- Wallet not connected prompt -->
    <EmptyState
      v-if="!connected"
      title="Connect Your Wallet"
      description="Connect your wallet to access creator tools and manage your collections."
      icon="collections"
    />

    <template v-else>
      <!-- Pump Interface Section -->
      <section class="pump-section mb-8">
        <PumpEntry />
      </section>

      <!-- Visual Divider -->
      <div class="divider relative my-10">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-200"></div>
        </div>
        <div class="relative flex justify-center">
          <span class="px-4 bg-gray-50 text-sm text-gray-500 font-medium">NFT Collection Tools</span>
        </div>
      </div>

      <!-- NFT Collection Tools Section -->
      <section class="nft-tools-section">
        <div class="grid gap-6 md:grid-cols-2">
          <!-- Create Collection Card -->
          <div class="card hover:shadow-md transition-shadow">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">Create Collection</h3>
                <p class="text-gray-500 text-sm mb-4">
                  Start a new NFT collection with custom name, symbol, and properties.
                </p>
                <button
                  class="btn-secondary text-sm"
                  disabled
                  title="Coming in creators-create-collection task"
                >
                  <span class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create New
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- Manage Classes Card -->
          <div class="card hover:shadow-md transition-shadow">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">Manage Classes</h3>
                <p class="text-gray-500 text-sm mb-4">
                  Define token classes within your collections with custom attributes.
                </p>
                <button
                  class="btn-secondary text-sm"
                  disabled
                  title="Coming in creators-manage-classes task"
                >
                  <span class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Manage
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- My Collections Section Placeholder -->
        <div class="mt-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">My Collections</h3>
            <span class="text-sm text-gray-500">Coming soon in creators-collections task</span>
          </div>

          <!-- Empty state for collections -->
          <div class="card bg-gray-50 border-dashed">
            <div class="text-center py-8">
              <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h4 class="text-gray-600 font-medium mb-1">No Collections Yet</h4>
              <p class="text-gray-500 text-sm">
                Your created collections will appear here.
              </p>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
