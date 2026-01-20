<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const isSubmitting = ref(false)
const isSubmitted = ref(false)
const submitError = ref('')

const handleEmailSubmit = async () => {
  if (!email.value || !email.value.includes('@')) {
    submitError.value = 'Please enter a valid email address'
    return
  }

  isSubmitting.value = true
  submitError.value = ''

  // Simulate submission (in real app, would send to backend)
  // For now, just show success after a delay
  await new Promise(resolve => setTimeout(resolve, 500))

  isSubmitted.value = true
  isSubmitting.value = false
}
</script>

<template>
  <div class="space-y-8">
    <!-- Hero Section -->
    <div class="card bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 text-center py-12 px-6">
      <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-200 flex items-center justify-center">
        <svg class="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </div>
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-200 text-gray-600 text-sm font-medium mb-4">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Coming Soon
      </div>
      <h2 class="text-2xl font-bold text-gray-700 mb-3">Export Wallet Activity</h2>
      <p class="text-gray-500 max-w-lg mx-auto">
        Export your complete transaction history to CSV format for tax reporting,
        portfolio tracking, or personal records. Filter by date range, token type, and more.
      </p>
    </div>

    <!-- Feature Preview Mockup -->
    <div class="card border border-gray-200 opacity-75">
      <div class="border-b border-gray-100 px-6 py-4">
        <h3 class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Export Preview</h3>
      </div>

      <!-- Mockup Form -->
      <div class="p-6 space-y-6">
        <!-- Date Range -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-500">Date Range</label>
          <div class="flex items-center gap-3">
            <div class="flex-1 px-4 py-2.5 bg-gray-100 rounded-lg text-gray-400 text-sm cursor-not-allowed">
              Start Date
            </div>
            <span class="text-gray-400">to</span>
            <div class="flex-1 px-4 py-2.5 bg-gray-100 rounded-lg text-gray-400 text-sm cursor-not-allowed">
              End Date
            </div>
          </div>
        </div>

        <!-- Token Type Filter -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-500">Token Types</label>
          <div class="flex flex-wrap gap-2">
            <div class="px-4 py-2 bg-gray-100 rounded-lg text-gray-400 text-sm cursor-not-allowed flex items-center gap-2">
              <div class="w-4 h-4 rounded border-2 border-gray-300 bg-gray-200" />
              Fungible Tokens
            </div>
            <div class="px-4 py-2 bg-gray-100 rounded-lg text-gray-400 text-sm cursor-not-allowed flex items-center gap-2">
              <div class="w-4 h-4 rounded border-2 border-gray-300 bg-gray-200" />
              NFTs
            </div>
            <div class="px-4 py-2 bg-gray-100 rounded-lg text-gray-400 text-sm cursor-not-allowed flex items-center gap-2">
              <div class="w-4 h-4 rounded border-2 border-gray-300 bg-gray-200" />
              All Transactions
            </div>
          </div>
        </div>

        <!-- Transaction Types -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-500">Transaction Types</label>
          <div class="flex flex-wrap gap-2">
            <span class="px-3 py-1.5 bg-gray-100 rounded-full text-gray-400 text-sm cursor-not-allowed">Transfers</span>
            <span class="px-3 py-1.5 bg-gray-100 rounded-full text-gray-400 text-sm cursor-not-allowed">Mints</span>
            <span class="px-3 py-1.5 bg-gray-100 rounded-full text-gray-400 text-sm cursor-not-allowed">Burns</span>
            <span class="px-3 py-1.5 bg-gray-100 rounded-full text-gray-400 text-sm cursor-not-allowed">Allowances</span>
          </div>
        </div>

        <!-- Export Button -->
        <div class="pt-4">
          <button
            disabled
            class="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-400 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export to CSV
          </button>
        </div>
      </div>
    </div>

    <!-- Planned Features List -->
    <div class="card border border-gray-200">
      <div class="border-b border-gray-100 px-6 py-4">
        <h3 class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Planned Features</h3>
      </div>
      <div class="p-6">
        <ul class="space-y-4">
          <li class="flex items-start gap-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 class="font-medium text-gray-700">Date Range Filters</h4>
              <p class="text-sm text-gray-500">Export transactions from specific time periods for tax seasons or reporting periods.</p>
            </div>
          </li>
          <li class="flex items-start gap-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <h4 class="font-medium text-gray-700">FT/NFT Selection</h4>
              <p class="text-sm text-gray-500">Filter exports by fungible tokens, NFTs, or both. Select specific collections or token types.</p>
            </div>
          </li>
          <li class="flex items-start gap-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h4 class="font-medium text-gray-700">CSV Download</h4>
              <p class="text-sm text-gray-500">Download a clean, formatted CSV file compatible with popular tax software and spreadsheet applications.</p>
            </div>
          </li>
          <li class="flex items-start gap-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h4 class="font-medium text-gray-700">Transaction History</h4>
              <p class="text-sm text-gray-500">Include transfers, mints, burns, and allowance changes with timestamps and transaction hashes.</p>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Email Signup (Optional) -->
    <div class="card border border-gray-200 bg-gray-50">
      <div class="p-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
            <svg class="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-700">Get Notified</h3>
            <p class="text-sm text-gray-500">Enter your email to be notified when the export feature is available.</p>
          </div>
        </div>

        <div v-if="!isSubmitted" class="mt-4">
          <div class="flex flex-col sm:flex-row gap-3">
            <input
              v-model="email"
              type="email"
              placeholder="your@email.com"
              class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              :disabled="isSubmitting"
            />
            <button
              @click="handleEmailSubmit"
              :disabled="isSubmitting"
              class="px-6 py-2.5 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg v-if="isSubmitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>{{ isSubmitting ? 'Submitting...' : 'Notify Me' }}</span>
            </button>
          </div>
          <p v-if="submitError" class="mt-2 text-sm text-red-600">{{ submitError }}</p>
        </div>

        <div v-else class="mt-4 flex items-center gap-3 text-green-600">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span class="text-sm font-medium">Thanks! We'll notify you when export is available.</span>
        </div>
      </div>
    </div>
  </div>
</template>
