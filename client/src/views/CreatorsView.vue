<script setup lang="ts">
import { ref } from 'vue';
import { useCreatorStore, type NftTokenClassWithSupply } from '@/stores/creators';
import { useWalletStore } from '@/stores/wallet';
import { useWalletEffect } from '@/composables/useWalletEffect';
import PageHeader from '@/components/ui/PageHeader.vue';
import ErrorDisplay from '@/components/ui/ErrorDisplay.vue';
import CollectionList from '@/components/creators/CollectionList.vue';
import ClassList from '@/components/creators/ClassList.vue';
import CreateCollectionModal from '@/components/creators/CreateCollectionModal.vue';
import CreateClassModal from '@/components/creators/CreateClassModal.vue';
import CollectionMintModal from '@/components/creators/CollectionMintModal.vue';

const creatorStore = useCreatorStore();
const walletStore = useWalletStore();

useWalletEffect(
  () => creatorStore.fetchCollections(),
  () => creatorStore.reset(),
);

// Modal state
type ModalType = 'createCollection' | 'createClass' | 'mint' | null;
const activeModal = ref<ModalType>(null);
const selectedMintClass = ref<NftTokenClassWithSupply | null>(null);

function openCreateCollection() {
  activeModal.value = 'createCollection';
}

function openCreateClass() {
  activeModal.value = 'createClass';
}

function openMint(tokenClass: NftTokenClassWithSupply) {
  selectedMintClass.value = tokenClass;
  activeModal.value = 'mint';
}

function closeModal() {
  activeModal.value = null;
  selectedMintClass.value = null;
}

</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <PageHeader
      title="Creator Tools"
      description="Manage your NFT collections, token classes, and minting"
    >
      <template #actions>
        <button
          v-if="walletStore.isConnected"
          class="btn-primary"
          @click="openCreateCollection"
        >
          Claim Collection
        </button>
      </template>
    </PageHeader>

    <!-- Error Display -->
    <ErrorDisplay
      v-if="creatorStore.error"
      :message="creatorStore.error"
      retryable
      @retry="creatorStore.fetchCollections()"
    />

    <!-- Collections Section -->
    <section>
      <h3 class="mb-3 text-lg font-semibold text-white">Collections</h3>
      <CollectionList
        :collections="creatorStore.collections"
        :is-loading="creatorStore.isLoadingCollections"
        :selected-collection="creatorStore.selectedCollection"
        @select="creatorStore.selectCollection($event)"
        @create="openCreateCollection"
      />
    </section>

    <!-- Token Classes Section (shown when collection selected) -->
    <section v-if="creatorStore.selectedCollection">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-white">
          Token Classes
          <span class="text-surface-400">
            &mdash; {{ creatorStore.selectedCollection.collection }}
          </span>
        </h3>
        <button class="btn-secondary text-xs" @click="openCreateClass">
          Create Token Class
        </button>
      </div>
      <ClassList
        :classes="creatorStore.tokenClasses"
        :is-loading="creatorStore.isLoadingClasses"
        @mint="openMint"
        @create="openCreateClass"
      />
    </section>

    <!-- Modals -->
    <CreateCollectionModal
      :open="activeModal === 'createCollection'"
      @close="closeModal"
    />
    <CreateClassModal
      :open="activeModal === 'createClass'"
      :collection="creatorStore.selectedCollection?.collection ?? ''"
      @close="closeModal"
    />
    <CollectionMintModal
      :open="activeModal === 'mint'"
      :token-class="selectedMintClass"
      @close="closeModal"
    />
  </div>
</template>
