<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'
import ExportComingSoon from '@/components/export/ExportComingSoon.vue'
</script>

<template>
  <div>
    <PageHeader
      title="Export"
      description="Export your wallet activity to CSV format."
    />

    <ExportComingSoon />
  </div>
</template>
