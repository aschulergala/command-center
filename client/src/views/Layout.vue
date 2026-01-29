<script setup lang="ts">
import { ref } from 'vue';
import { RouterView, RouterLink, useRoute } from 'vue-router';
import WalletConnect from '@/components/wallet/WalletConnect.vue';
import EnvironmentToggle from '@/components/wallet/EnvironmentToggle.vue';

const navItems = [
  { to: '/tokens', label: 'Tokens' },
  { to: '/nfts', label: 'NFTs' },
  { to: '/creators', label: 'Creators' },
  { to: '/export', label: 'Export' },
];

const mobileMenuOpen = ref(false);
const route = useRoute();

function isActive(path: string) {
  return route.path.startsWith(path);
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="sticky top-0 z-40 border-b border-surface-800 bg-surface-950/95 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <!-- Logo + mobile menu button -->
        <div class="flex items-center gap-3">
          <button
            class="rounded-lg p-2 text-surface-400 hover:bg-surface-800 hover:text-white md:hidden"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <RouterLink to="/" class="text-lg font-bold text-white">
            Command Center
          </RouterLink>
        </div>

        <!-- Desktop nav -->
        <nav class="hidden items-center gap-1 md:flex">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            :class="isActive(item.to)
              ? 'bg-surface-800 text-white'
              : 'text-surface-400 hover:bg-surface-800 hover:text-white'"
          >
            {{ item.label }}
          </RouterLink>
        </nav>

        <!-- Right side: env toggle + wallet -->
        <div class="flex items-center gap-2">
          <EnvironmentToggle />
          <WalletConnect />
        </div>
      </div>

      <!-- Mobile menu -->
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="-translate-y-2 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="-translate-y-2 opacity-0"
      >
        <nav
          v-if="mobileMenuOpen"
          class="border-t border-surface-800 bg-surface-950 px-4 py-3 md:hidden"
        >
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
            :class="isActive(item.to)
              ? 'bg-surface-800 text-white'
              : 'text-surface-400 hover:bg-surface-800 hover:text-white'"
            @click="mobileMenuOpen = false"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </Transition>
    </header>

    <main class="flex-1">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <RouterView />
      </div>
    </main>

    <footer class="border-t border-surface-800 py-4">
      <div class="mx-auto max-w-7xl px-4 text-center text-xs text-surface-600 sm:px-6 lg:px-8">
        GalaChain Command Center
      </div>
    </footer>
  </div>
</template>
