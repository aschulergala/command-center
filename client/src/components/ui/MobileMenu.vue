<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

interface Props {
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()

const navItems = [
  {
    name: 'Tokens',
    to: '/tokens',
    icon: 'coins',
    description: 'View and manage your fungible tokens'
  },
  {
    name: 'NFTs',
    to: '/nfts',
    icon: 'image',
    description: 'Browse and transfer your NFT collection'
  },
  {
    name: 'Creators',
    to: '/creators',
    icon: 'sparkles',
    description: 'Create and manage token collections'
  },
  {
    name: 'Export',
    to: '/export',
    icon: 'download',
    description: 'Export your wallet activity',
    comingSoon: true,
  },
]

const isActive = (to: string) => {
  return route.path === to || (to === '/tokens' && route.path === '/')
}

// Close on route change
watch(() => route.path, () => {
  emit('close')
})

// Close on escape key
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}

// Prevent body scroll when menu is open
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-black/50"
        @click="emit('close')"
      />
    </Transition>

    <!-- Drawer -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="open"
        class="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white shadow-2xl safe-area-inset"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-br from-gala-primary to-gala-secondary rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span class="text-lg font-semibold text-gray-900">Menu</span>
          </div>
          <button
            type="button"
            class="p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
            @click="emit('close')"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="px-2 py-4" role="navigation" aria-label="Mobile navigation">
          <ul class="space-y-1">
            <li v-for="item in navItems" :key="item.to">
              <RouterLink
                :to="item.to"
                class="flex items-center gap-4 px-4 py-3 rounded-lg touch-target transition-colors"
                :class="[
                  isActive(item.to)
                    ? 'bg-gala-light text-gala-primary'
                    : 'text-gray-700 hover:bg-gray-100'
                ]"
              >
                <!-- Icon -->
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  :class="[
                    isActive(item.to)
                      ? 'bg-gala-primary/10'
                      : 'bg-gray-100'
                  ]"
                >
                  <svg
                    v-if="item.icon === 'coins'"
                    class="w-5 h-5"
                    :class="isActive(item.to) ? 'text-gala-primary' : 'text-gray-500'"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg
                    v-else-if="item.icon === 'image'"
                    class="w-5 h-5"
                    :class="isActive(item.to) ? 'text-gala-primary' : 'text-gray-500'"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <svg
                    v-else-if="item.icon === 'sparkles'"
                    class="w-5 h-5"
                    :class="isActive(item.to) ? 'text-gala-primary' : 'text-gray-500'"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <svg
                    v-else-if="item.icon === 'download'"
                    class="w-5 h-5"
                    :class="isActive(item.to) ? 'text-gala-primary' : 'text-gray-500'"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>

                <!-- Text -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{{ item.name }}</span>
                    <span
                      v-if="item.comingSoon"
                      class="px-1.5 py-0.5 text-xs bg-gray-200 text-gray-600 rounded"
                    >
                      Soon
                    </span>
                  </div>
                  <p class="text-sm text-gray-500 truncate">{{ item.description }}</p>
                </div>

                <!-- Active indicator -->
                <svg
                  v-if="isActive(item.to)"
                  class="w-5 h-5 text-gala-primary flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </RouterLink>
            </li>
          </ul>
        </nav>

        <!-- Footer -->
        <div class="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-gray-200 bg-white safe-area-bottom">
          <p class="text-center text-sm text-gray-500">
            GalaChain Command Center
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Safe area insets for notched devices */
.safe-area-inset {
  padding-top: env(safe-area-inset-top, 0);
  padding-right: env(safe-area-inset-right, 0);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* Touch target minimum size */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
</style>
