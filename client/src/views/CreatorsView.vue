<script setup lang="ts">
/**
 * CreatorsView.vue
 * Main creators page with Pump Interface, NFT Collection Tools, and My Collections sections
 */
import { onMounted, ref } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import PumpEntry from '@/components/creators/PumpEntry.vue'
import CollectionList from '@/components/creators/CollectionList.vue'
import CreateCollectionModal from '@/components/creators/CreateCollectionModal.vue'
import { useWallet } from '@/composables/useWallet'
import { useCreatorCollections } from '@/composables/useCreatorCollections'
import type { CreatorCollectionDisplay } from '@/stores/creatorCollections'

const { connected } = useWallet()
const {
  collections,
  isLoading,
  error,
  hasCollections,
  totalCollectionCount,
  fetchCollections,
  refresh,
  toggleExpanded,
} = useCreatorCollections()

// Track if initial fetch has happened
const hasFetched = ref(false)

// Modal states
const showCreateCollectionModal = ref(false)

// Fetch collections on mount if connected
onMounted(async () => {
  if (connected.value) {
    await fetchCollections()
    hasFetched.value = true
  }
})

/**
 * Handle refresh button click
 */
async function handleRefresh() {
  await refresh(true)
}

/**
 * Open create collection modal
 */
function openCreateCollectionModal() {
  showCreateCollectionModal.value = true
}

/**
 * Close create collection modal
 */
function closeCreateCollectionModal() {
  showCreateCollectionModal.value = false
}

/**
 * Handle successful collection creation
 */
async function handleCollectionCreated() {
  showCreateCollectionModal.value = false
  // Refresh collections to show the new one
  await refresh(true)
}

/**
 * Handle mint from collection
 */
function handleMint(collection: CreatorCollectionDisplay) {
  // Will be implemented in creators-mint-from-collection task
  console.log('Mint from collection:', collection.collectionKey)
  // For now, could open the MintNFTModal from NFTs page
  // or show a message that this feature is coming soon
}

/**
 * Handle manage classes
 */
function handleManageClasses(collection: CreatorCollectionDisplay) {
  // Will be implemented in creators-manage-classes task
  console.log('Manage classes for:', collection.collectionKey)
}

/**
 * Handle toggle expand
 */
function handleToggleExpand(collectionKey: string) {
  toggleExpanded(collectionKey)
}
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
                  class="btn-primary text-sm"
                  @click="openCreateCollectionModal"
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

        <!-- My Collections Section -->
        <div class="mt-8">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <h3 class="text-lg font-semibold text-gray-900">My Collections</h3>
              <span
                v-if="hasCollections"
                class="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
              >
                {{ totalCollectionCount }}
              </span>
            </div>

            <!-- Refresh Button -->
            <button
              class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              :disabled="isLoading"
              @click="handleRefresh"
            >
              <LoadingSpinner v-if="isLoading" size="sm" />
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>

          <!-- Error Display -->
          <div v-if="error" class="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="text-sm font-medium text-red-800">Failed to load collections</p>
                <p class="text-sm text-red-600 mt-1">{{ error }}</p>
                <button
                  class="mt-2 text-sm text-red-700 hover:text-red-800 underline"
                  @click="handleRefresh"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>

          <!-- Collections List -->
          <CollectionList
            :collections="collections"
            :is-loading="isLoading"
            @mint="handleMint"
            @manage-classes="handleManageClasses"
            @toggle-expand="handleToggleExpand"
          />
        </div>
      </section>

      <!-- Create Collection Modal -->
      <CreateCollectionModal
        :open="showCreateCollectionModal"
        @close="closeCreateCollectionModal"
        @success="handleCollectionCreated"
      />
    </template>
  </div>
</template>
