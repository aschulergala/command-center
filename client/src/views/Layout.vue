<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import AppNavigation from '@/components/AppNavigation.vue'
import WalletConnect from '@/components/WalletConnect.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import TransactionIndicator from '@/components/ui/TransactionIndicator.vue'
import MobileMenu from '@/components/ui/MobileMenu.vue'

const isMobileMenuOpen = ref(false)

function openMobileMenu() {
  isMobileMenuOpen.value = true
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 safe-area-layout">
    <!-- Header -->
    <header class="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo / Brand -->
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-br from-gala-primary to-gala-secondary rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span class="text-lg font-semibold text-gray-900">GalaChain</span>
            <span class="text-sm text-gray-500 hidden sm:inline">Command Center</span>
          </div>

          <!-- Desktop Navigation -->
          <AppNavigation class="hidden md:flex" />

          <!-- Wallet Connect + Transaction Indicator -->
          <div class="flex items-center gap-2">
            <TransactionIndicator />
            <WalletConnect />
            <!-- Mobile Menu Button -->
            <button
              class="md:hidden p-2 min-h-[44px] min-w-[44px] text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg flex items-center justify-center"
              aria-label="Open menu"
              @click="openMobileMenu"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <AppNavigation class="md:hidden border-t border-gray-100" :mobile="true" />
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-200 bg-white mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p class="text-center text-sm text-gray-500">
          GalaChain Command Center &copy; {{ new Date().getFullYear() }}
        </p>
      </div>
    </footer>

    <!-- Toast Notifications -->
    <ToastContainer />

    <!-- Mobile Menu Drawer -->
    <MobileMenu :open="isMobileMenuOpen" @close="closeMobileMenu" />
  </div>
</template>

<style scoped>
/* Safe area layout for notched devices */
.safe-area-layout {
  padding-left: env(safe-area-inset-left, 0);
  padding-right: env(safe-area-inset-right, 0);
}
</style>
