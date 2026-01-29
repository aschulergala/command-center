<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useWalletStore } from '@/stores/wallet';
import ToastContainer from '@/components/ui/ToastContainer.vue';

const walletStore = useWalletStore();

onMounted(() => {
  walletStore.autoReconnect();
});
</script>

<template>
  <RouterView />
  <ToastContainer />
</template>
