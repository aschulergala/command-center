<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import TokenList from '@/components/tokens/TokenList.vue'
import AllowanceList from '@/components/tokens/AllowanceList.vue'
import SortDropdown from '@/components/tokens/SortDropdown.vue'
import TransferModal from '@/components/tokens/TransferModal.vue'
import MintModal from '@/components/tokens/MintModal.vue'
import BurnModal from '@/components/tokens/BurnModal.vue'
import { useFungibleTokens } from '@/composables/useFungibleTokens'
import type { FungibleTokenDisplay } from '@shared/types/display'

const {
  tokens,
  allowancesReceived,
  allowancesGranted,
  isLoading,
  isLoadingAllowances,
  error,
  sortBy,
  isConnected,
  fetchAll,
  setSort,
} = useFungibleTokens()

// Active tab for main view: 'balances' or 'allowances'
const showAllowances = ref(false)

// Sub-tab for allowances: 'received' (granted TO user) or 'granted' (granted BY user)
const allowancesTab = ref<'received' | 'granted'>('received')

// Transfer modal state
const transferModalOpen = ref(false)
const selectedTokenForTransfer = ref<FungibleTokenDisplay | null>(null)

// Mint modal state
const mintModalOpen = ref(false)
const selectedTokenForMint = ref<FungibleTokenDisplay | null>(null)

// Burn modal state
const burnModalOpen = ref(false)
const selectedTokenForBurn = ref<FungibleTokenDisplay | null>(null)

// Fetch tokens on mount if connected
onMounted(async () => {
  if (isConnected.value) {
    await fetchAll()
  }
})

// Handler functions for token actions
function handleTransfer(token: FungibleTokenDisplay): void {
  selectedTokenForTransfer.value = token
  transferModalOpen.value = true
}

function handleCloseTransferModal(): void {
  transferModalOpen.value = false
  selectedTokenForTransfer.value = null
}

async function handleTransferSuccess(token: FungibleTokenDisplay): Promise<void> {
  // Refresh token balances after successful transfer
  await fetchAll()
  console.log('Transfer successful for token:', token.tokenKey)
}

function handleMint(token: FungibleTokenDisplay): void {
  selectedTokenForMint.value = token
  mintModalOpen.value = true
}

function handleCloseMintModal(): void {
  mintModalOpen.value = false
  selectedTokenForMint.value = null
}

async function handleMintSuccess(token: FungibleTokenDisplay): Promise<void> {
  // Refresh token balances and allowances after successful mint
  await fetchAll()
  console.log('Mint successful for token:', token.tokenKey)
}

function handleBurn(token: FungibleTokenDisplay): void {
  selectedTokenForBurn.value = token
  burnModalOpen.value = true
}

function handleCloseBurnModal(): void {
  burnModalOpen.value = false
  selectedTokenForBurn.value = null
}

async function handleBurnSuccess(token: FungibleTokenDisplay): Promise<void> {
  // Refresh token balances after successful burn
  await fetchAll()
  console.log('Burn successful for token:', token.tokenKey)
}

async function handleRefresh(): Promise<void> {
  await fetchAll()
}
</script>

<template>
  <div>
    <!-- Header -->
    <PageHeader
      title="Tokens"
      description="View and manage your fungible tokens."
    />

    <!-- Not Connected State -->
    <EmptyState
      v-if="!isConnected"
      title="Connect Your Wallet"
      description="Connect your wallet to view and manage your fungible tokens."
      icon="tokens"
    />

    <!-- Connected Content -->
    <template v-else>
      <!-- Error State -->
      <div
        v-if="error"
        class="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 mb-6"
      >
        <div class="flex items-start gap-3">
          <svg
            class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div class="flex-1">
            <h4 class="font-medium text-red-800 dark:text-red-300">
              Failed to load tokens
            </h4>
            <p class="text-sm text-red-600 dark:text-red-400 mt-1">
              {{ error }}
            </p>
            <button
              class="text-sm text-red-700 dark:text-red-300 underline hover:no-underline mt-2"
              @click="handleRefresh"
            >
              Try again
            </button>
          </div>
        </div>
      </div>

      <!-- Controls Bar -->
      <div class="flex items-center justify-between mb-6">
        <!-- Tabs -->
        <div class="flex gap-2">
          <button
            class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="!showAllowances
              ? 'bg-gala-primary text-white'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'"
            @click="showAllowances = false"
          >
            Balances
          </button>
          <button
            class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="showAllowances
              ? 'bg-gala-primary text-white'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'"
            @click="showAllowances = true"
          >
            Allowances
            <span
              v-if="allowancesReceived.length > 0"
              class="ml-1 px-1.5 py-0.5 text-xs rounded-full"
              :class="showAllowances
                ? 'bg-white/20 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'"
            >
              {{ allowancesReceived.length }}
            </span>
          </button>
        </div>

        <!-- Sort & Refresh -->
        <div class="flex items-center gap-2">
          <SortDropdown
            v-if="!showAllowances"
            :model-value="sortBy"
            @update:model-value="setSort"
          />

          <button
            class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            :class="{ 'animate-spin': isLoading }"
            :disabled="isLoading"
            title="Refresh"
            @click="handleRefresh"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Token Balances Tab -->
      <div v-if="!showAllowances">
        <TokenList
          :tokens="tokens"
          :is-loading="isLoading"
          @transfer="handleTransfer"
          @mint="handleMint"
          @burn="handleBurn"
        />
      </div>

      <!-- Allowances Tab -->
      <div v-else>
        <!-- Allowances Sub-tabs: Received / Granted -->
        <div class="mb-4 border-b border-gray-200 dark:border-gray-700">
          <nav class="flex gap-4" aria-label="Allowances tabs">
            <button
              class="pb-2 text-sm font-medium border-b-2 transition-colors"
              :class="allowancesTab === 'received'
                ? 'border-gala-primary text-gala-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
              @click="allowancesTab = 'received'"
            >
              Received
              <span
                v-if="allowancesReceived.length > 0"
                class="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800"
              >
                {{ allowancesReceived.length }}
              </span>
            </button>
            <button
              class="pb-2 text-sm font-medium border-b-2 transition-colors"
              :class="allowancesTab === 'granted'
                ? 'border-gala-primary text-gala-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
              @click="allowancesTab = 'granted'"
            >
              Granted
              <span
                v-if="allowancesGranted.length > 0"
                class="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800"
              >
                {{ allowancesGranted.length }}
              </span>
            </button>
          </nav>
        </div>

        <!-- Received Allowances (granted TO the user) -->
        <div v-if="allowancesTab === 'received'">
          <AllowanceList
            :allowances="allowancesReceived"
            :is-loading="isLoadingAllowances"
            view-mode="received"
          />
        </div>

        <!-- Granted Allowances (granted BY the user) -->
        <div v-else>
          <!-- API Limitation Notice -->
          <div class="card bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 mb-4">
            <div class="flex items-start gap-3">
              <svg
                class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 class="font-medium text-amber-800 dark:text-amber-300">
                  Feature Not Yet Available
                </h4>
                <p class="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  Viewing allowances you've granted to others is not currently supported by the GalaChain API.
                  This feature will be available when the API adds support for querying by grantor.
                </p>
              </div>
            </div>
          </div>

          <!-- Show any granted allowances if we have them (future-proofing) -->
          <AllowanceList
            v-if="allowancesGranted.length > 0"
            :allowances="allowancesGranted"
            :is-loading="isLoadingAllowances"
            view-mode="granted"
          />
        </div>
      </div>
    </template>

    <!-- Transfer Modal -->
    <TransferModal
      :token="selectedTokenForTransfer"
      :open="transferModalOpen"
      @close="handleCloseTransferModal"
      @success="handleTransferSuccess"
    />

    <!-- Mint Modal -->
    <MintModal
      :token="selectedTokenForMint"
      :open="mintModalOpen"
      @close="handleCloseMintModal"
      @success="handleMintSuccess"
    />

    <!-- Burn Modal -->
    <BurnModal
      :token="selectedTokenForBurn"
      :open="burnModalOpen"
      @close="handleCloseBurnModal"
      @success="handleBurnSuccess"
    />
  </div>
</template>
