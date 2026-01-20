<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import {
  useTransactionsStore,
  TransactionStatus,
  getTransactionTypeLabel,
  getTransactionStatusLabel,
  getExplorerUrl,
} from '@/stores/transactions';

const store = useTransactionsStore();
const { pendingTxs, recentTxs, hasPendingTxs, pendingCount, hasRecentTxs } = storeToRefs(store);

const isDropdownOpen = ref(false);

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('[data-transaction-dropdown]')) {
    isDropdownOpen.value = false;
  }
}

// Register click outside handler
if (typeof document !== 'undefined') {
  document.addEventListener('click', handleClickOutside);
}

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('click', handleClickOutside);
  }
});

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // Less than a minute ago
  if (diff < 60000) {
    return 'Just now';
  }

  // Less than an hour ago
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  // Less than a day ago
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // Format as date
  return date.toLocaleDateString();
}

function getStatusColor(status: TransactionStatus): string {
  switch (status) {
    case TransactionStatus.Pending:
    case TransactionStatus.Confirming:
      return 'text-blue-600';
    case TransactionStatus.Confirmed:
      return 'text-green-600';
    case TransactionStatus.Failed:
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

function getStatusBg(status: TransactionStatus): string {
  switch (status) {
    case TransactionStatus.Pending:
    case TransactionStatus.Confirming:
      return 'bg-blue-100';
    case TransactionStatus.Confirmed:
      return 'bg-green-100';
    case TransactionStatus.Failed:
      return 'bg-red-100';
    default:
      return 'bg-gray-100';
  }
}
</script>

<template>
  <div class="relative" data-transaction-dropdown>
    <!-- Indicator Button -->
    <button
      class="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      :class="{ 'text-blue-600': hasPendingTxs }"
      aria-label="Transaction history"
      @click="toggleDropdown"
    >
      <!-- Transaction icon -->
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>

      <!-- Pending count badge -->
      <span
        v-if="hasPendingTxs"
        class="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center justify-center animate-pulse"
      >
        {{ pendingCount }}
      </span>
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isDropdownOpen"
        class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
      >
        <div class="p-3 border-b border-gray-100">
          <h3 class="text-sm font-semibold text-gray-900">Transactions</h3>
        </div>

        <!-- Pending Transactions Section -->
        <div v-if="hasPendingTxs" class="border-b border-gray-100">
          <div class="px-3 py-2 bg-blue-50">
            <h4 class="text-xs font-medium text-blue-700 uppercase tracking-wide">
              Pending ({{ pendingCount }})
            </h4>
          </div>
          <ul class="max-h-48 overflow-y-auto">
            <li
              v-for="tx in pendingTxs"
              :key="tx.id"
              class="px-3 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ getTransactionTypeLabel(tx.type) }}
                  </p>
                  <p class="text-xs text-gray-500 truncate">{{ tx.description }}</p>
                </div>
                <div class="flex items-center gap-1">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    :class="[getStatusBg(tx.status), getStatusColor(tx.status)]"
                  >
                    <svg
                      class="w-3 h-3 mr-1 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {{ getTransactionStatusLabel(tx.status) }}
                  </span>
                </div>
              </div>
              <p class="text-xs text-gray-400 mt-1">{{ formatTime(tx.timestamp) }}</p>
            </li>
          </ul>
        </div>

        <!-- Recent Transactions Section -->
        <div v-if="hasRecentTxs">
          <div class="px-3 py-2 bg-gray-50">
            <h4 class="text-xs font-medium text-gray-500 uppercase tracking-wide">Recent</h4>
          </div>
          <ul class="max-h-64 overflow-y-auto">
            <li
              v-for="tx in recentTxs"
              :key="tx.id"
              class="px-3 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ getTransactionTypeLabel(tx.type) }}
                  </p>
                  <p class="text-xs text-gray-500 truncate">{{ tx.description }}</p>
                </div>
                <div class="flex items-center gap-1">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    :class="[getStatusBg(tx.status), getStatusColor(tx.status)]"
                  >
                    <!-- Success check icon -->
                    <svg
                      v-if="tx.status === TransactionStatus.Confirmed"
                      class="w-3 h-3 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <!-- Error X icon -->
                    <svg
                      v-else-if="tx.status === TransactionStatus.Failed"
                      class="w-3 h-3 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    {{ getTransactionStatusLabel(tx.status) }}
                  </span>
                </div>
              </div>
              <div class="flex items-center justify-between mt-1">
                <p class="text-xs text-gray-400">{{ formatTime(tx.timestamp) }}</p>
                <!-- Explorer link for confirmed transactions with hash -->
                <a
                  v-if="tx.hash && tx.status === TransactionStatus.Confirmed"
                  :href="getExplorerUrl(tx.hash)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-xs text-gala-primary hover:text-gala-primary-dark flex items-center gap-1"
                >
                  View
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
              <!-- Error message for failed transactions -->
              <p
                v-if="tx.status === TransactionStatus.Failed && tx.error"
                class="text-xs text-red-600 mt-1 truncate"
                :title="tx.error"
              >
                {{ tx.error }}
              </p>
            </li>
          </ul>
        </div>

        <!-- Empty State -->
        <div
          v-if="!hasPendingTxs && !hasRecentTxs"
          class="px-4 py-8 text-center"
        >
          <svg
            class="w-10 h-10 mx-auto text-gray-300 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p class="text-sm text-gray-500">No transactions yet</p>
        </div>

        <!-- Clear Recent Button -->
        <div v-if="hasRecentTxs" class="p-2 border-t border-gray-100 bg-gray-50">
          <button
            class="w-full text-center text-xs text-gray-500 hover:text-gray-700 py-1"
            @click="store.clearRecent()"
          >
            Clear recent transactions
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
