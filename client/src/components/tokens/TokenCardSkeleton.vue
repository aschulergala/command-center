<script setup lang="ts">
// Token card loading skeleton with shimmer animation
</script>

<template>
  <div class="card animate-pulse">
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <!-- Icon skeleton -->
        <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
        <!-- Name skeleton -->
        <div>
          <div class="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
          <div class="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>

    <!-- Balance skeleton -->
    <div class="mb-4">
      <div class="flex items-baseline justify-between">
        <div class="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div class="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>

    <!-- Button skeleton -->
    <div class="flex gap-2">
      <div class="h-9 flex-1 bg-gray-200 dark:bg-gray-700 rounded-lg" />
    </div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.animate-pulse > div {
  background: linear-gradient(
    90deg,
    theme('colors.gray.200') 25%,
    theme('colors.gray.100') 50%,
    theme('colors.gray.200') 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

:root.dark .animate-pulse > div {
  background: linear-gradient(
    90deg,
    theme('colors.gray.700') 25%,
    theme('colors.gray.600') 50%,
    theme('colors.gray.700') 75%
  );
  background-size: 200% 100%;
}
</style>
