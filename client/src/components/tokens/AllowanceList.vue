<script setup lang="ts">
import { computed } from 'vue'
import type { AllowanceDisplay } from '@shared/types/display'
import { AllowanceType } from '@gala-chain/api'

interface Props {
  allowances: AllowanceDisplay[]
  isLoading?: boolean
  /**
   * View mode determines which party to display
   * - 'received': Shows allowances granted TO the user (shows grantedBy as "From:")
   * - 'granted': Shows allowances granted BY the user (shows grantedTo as "To:")
   */
  viewMode?: 'received' | 'granted'
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'received'
})

// Group allowances by type
const mintAllowances = computed(() =>
  props.allowances.filter(a => a.allowanceType === AllowanceType.Mint)
)

const burnAllowances = computed(() =>
  props.allowances.filter(a => a.allowanceType === AllowanceType.Burn)
)

const transferAllowances = computed(() =>
  props.allowances.filter(a =>
    a.allowanceType === AllowanceType.Transfer ||
    a.allowanceType === AllowanceType.Lock ||
    a.allowanceType === AllowanceType.Use
  )
)

/**
 * Truncate an address for display
 */
function truncateAddress(address: string): string {
  if (address.length <= 16) return address
  return `${address.slice(0, 8)}...${address.slice(-6)}`
}

/**
 * Get the party label based on view mode
 */
const partyLabel = computed(() => props.viewMode === 'received' ? 'From' : 'To')

/**
 * Get the party address for an allowance based on view mode
 */
function getPartyAddress(allowance: AllowanceDisplay): string {
  return props.viewMode === 'received' ? allowance.grantedBy : allowance.grantedTo
}

/**
 * Get the display label for an allowance type
 */
function getAllowanceTypeLabel(type: AllowanceType): string {
  switch (type) {
    case AllowanceType.Mint:
      return 'Mint'
    case AllowanceType.Burn:
      return 'Burn'
    case AllowanceType.Transfer:
      return 'Transfer'
    case AllowanceType.Lock:
      return 'Lock'
    case AllowanceType.Use:
      return 'Use'
    default:
      return 'Unknown'
  }
}

/**
 * Get the color class for an allowance type
 */
function getAllowanceTypeColor(type: AllowanceType): string {
  switch (type) {
    case AllowanceType.Mint:
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case AllowanceType.Burn:
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case AllowanceType.Transfer:
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div v-if="isLoading" class="card animate-pulse">
      <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div class="space-y-3">
        <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
        <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="allowances.length === 0"
      class="card text-center py-8"
    >
      <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <svg
          class="w-6 h-6 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      </div>
      <p class="text-gray-500 dark:text-gray-400">
        No active allowances
      </p>
    </div>

    <!-- Allowances by Type -->
    <template v-else>
      <!-- Mint Allowances -->
      <div v-if="mintAllowances.length > 0" class="card">
        <h4 class="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-green-500" />
          Mint Allowances
        </h4>
        <div class="divide-y divide-gray-100 dark:divide-gray-700">
          <div
            v-for="allowance in mintAllowances"
            :key="allowance.allowanceKey"
            class="py-3 first:pt-0 last:pb-0"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-sm text-gray-900 dark:text-white">
                  {{ allowance.type || allowance.collection }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ partyLabel }}: {{ truncateAddress(getPartyAddress(allowance)) }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-medium text-sm text-green-600 dark:text-green-400">
                  {{ allowance.quantityRemainingFormatted }}
                </p>
                <p
                  v-if="!allowance.isExpired && allowance.expires > 0"
                  class="text-xs text-gray-500 dark:text-gray-400"
                >
                  Expires: {{ allowance.expiresFormatted }}
                </p>
                <p
                  v-if="allowance.isExpired"
                  class="text-xs text-red-500"
                >
                  Expired
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Burn Allowances -->
      <div v-if="burnAllowances.length > 0" class="card">
        <h4 class="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-red-500" />
          Burn Allowances
        </h4>
        <div class="divide-y divide-gray-100 dark:divide-gray-700">
          <div
            v-for="allowance in burnAllowances"
            :key="allowance.allowanceKey"
            class="py-3 first:pt-0 last:pb-0"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-sm text-gray-900 dark:text-white">
                  {{ allowance.type || allowance.collection }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ partyLabel }}: {{ truncateAddress(getPartyAddress(allowance)) }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-medium text-sm text-red-600 dark:text-red-400">
                  {{ allowance.quantityRemainingFormatted }}
                </p>
                <p
                  v-if="!allowance.isExpired && allowance.expires > 0"
                  class="text-xs text-gray-500 dark:text-gray-400"
                >
                  Expires: {{ allowance.expiresFormatted }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Transfer/Other Allowances -->
      <div v-if="transferAllowances.length > 0" class="card">
        <h4 class="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-blue-500" />
          Transfer Allowances
        </h4>
        <div class="divide-y divide-gray-100 dark:divide-gray-700">
          <div
            v-for="allowance in transferAllowances"
            :key="allowance.allowanceKey"
            class="py-3 first:pt-0 last:pb-0"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <p class="font-medium text-sm text-gray-900 dark:text-white">
                    {{ allowance.type || allowance.collection }}
                  </p>
                  <span
                    :class="getAllowanceTypeColor(allowance.allowanceType)"
                    class="px-2 py-0.5 text-xs font-medium rounded-full"
                  >
                    {{ getAllowanceTypeLabel(allowance.allowanceType) }}
                  </span>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ partyLabel }}: {{ truncateAddress(getPartyAddress(allowance)) }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-medium text-sm text-blue-600 dark:text-blue-400">
                  {{ allowance.quantityRemainingFormatted }}
                </p>
                <p
                  v-if="!allowance.isExpired && allowance.expires > 0"
                  class="text-xs text-gray-500 dark:text-gray-400"
                >
                  Expires: {{ allowance.expiresFormatted }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
