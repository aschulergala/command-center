<script setup lang="ts">
/**
 * CollectionCardSkeleton.vue
 * Loading skeleton for CollectionCard component
 */
</script>

<template>
  <div class="card animate-pulse">
    <div class="flex items-start gap-4">
      <!-- Image Skeleton -->
      <div class="flex-shrink-0 w-16 h-16 rounded-xl bg-gray-200"></div>

      <!-- Content Skeleton -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1">
            <!-- Title -->
            <div class="h-5 bg-gray-200 rounded w-32 mb-2"></div>
            <!-- Subtitle -->
            <div class="h-4 bg-gray-200 rounded w-48"></div>
          </div>
          <!-- Badge -->
          <div class="h-6 w-16 bg-gray-200 rounded-full"></div>
        </div>

        <!-- Stats Row -->
        <div class="mt-3 flex items-center gap-4">
          <div class="h-4 bg-gray-200 rounded w-20"></div>
          <div class="h-4 bg-gray-200 rounded w-32"></div>
        </div>

        <!-- Buttons -->
        <div class="mt-4 flex items-center gap-2">
          <div class="h-9 bg-gray-200 rounded w-20"></div>
          <div class="h-9 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>
  </div>
</template>
