<script setup lang="ts">
/**
 * PumpEntry.vue
 * Prominent card component for the Pump Interface entry point
 * Features eye-catching gradient styling and CTA button
 */

defineProps<{
  /** Whether to show as disabled (e.g., when wallet not connected) */
  disabled?: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()

// Pump URL - external link for now
const PUMP_URL = 'https://pump.gala.com'
</script>

<template>
  <div
    class="pump-entry relative overflow-hidden rounded-2xl bg-gradient-to-br from-gala-primary via-gala-secondary to-purple-600 p-1"
  >
    <div class="pump-entry-inner bg-white dark:bg-gray-900 rounded-xl p-6 md:p-8 relative overflow-hidden">
      <!-- Background decoration -->
      <div class="absolute top-0 right-0 w-64 h-64 -mr-16 -mt-16 opacity-10">
        <svg viewBox="0 0 200 200" class="w-full h-full text-gala-primary">
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" stroke-width="8" />
          <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" stroke-width="6" />
          <circle cx="100" cy="100" r="20" fill="currentColor" />
        </svg>
      </div>

      <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <!-- Content -->
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-3">
            <!-- Pump icon -->
            <div class="pump-icon flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-gala-primary to-gala-secondary text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 class="text-xl md:text-2xl font-bold text-gray-900">
                Pump Interface
              </h3>
              <span class="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-gala-accent/20 text-gala-accent">
                Launch Tokens
              </span>
            </div>
          </div>

          <p class="text-gray-600 text-sm md:text-base mb-4 max-w-lg">
            Launch your own token with our streamlined Pump interface. Create bonding curves,
            set token parameters, and deploy directly to GalaChain with just a few clicks.
          </p>

          <ul class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            <li class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Bonding curves
            </li>
            <li class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Custom parameters
            </li>
            <li class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              One-click deploy
            </li>
          </ul>
        </div>

        <!-- CTA Button -->
        <div class="flex-shrink-0">
          <a
            v-if="!disabled"
            :href="PUMP_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="pump-cta inline-flex items-center gap-2 px-6 py-3 text-lg font-semibold text-white rounded-xl bg-gradient-to-r from-gala-primary to-gala-secondary hover:from-gala-secondary hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            @click="$emit('click')"
          >
            <span>Launch a Token</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button
            v-else
            disabled
            class="pump-cta inline-flex items-center gap-2 px-6 py-3 text-lg font-semibold text-gray-400 rounded-xl bg-gray-100 cursor-not-allowed"
          >
            <span>Launch a Token</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Subtle animation on the gradient border */
.pump-entry {
  background-size: 200% 200%;
  animation: gradient-shift 6s ease infinite;
}

@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Hover effect on the card */
.pump-entry:hover .pump-entry-inner {
  transform: translateY(-2px);
}

.pump-entry-inner {
  transition: transform 0.3s ease;
}
</style>
