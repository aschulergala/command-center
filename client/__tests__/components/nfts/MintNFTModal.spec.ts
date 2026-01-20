/**
 * Tests for MintNFTModal component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import MintNFTModal from '@/components/nfts/MintNFTModal.vue'
import type { CollectionDisplay } from '@shared/types/display'
import BigNumber from 'bignumber.js'
import { ref, computed } from 'vue'

const mockCollection: CollectionDisplay = {
  collectionKey: 'TestNFT|Character|Hero|',
  collection: 'TestNFT',
  category: 'Character',
  type: 'Hero',
  additionalKey: '',
  name: 'Test Heroes',
  symbol: 'HERO',
  description: 'Test NFT collection',
  image: '',
  isNonFungible: true,
  maxSupply: '1000',
  totalSupply: '100',
  totalBurned: '0',
  isAuthority: false,
  ownedCount: 5,
}

const mockCollection2: CollectionDisplay = {
  ...mockCollection,
  collectionKey: 'OtherNFT|Item|Weapon|',
  collection: 'OtherNFT',
  type: 'Weapon',
  name: 'Weapons',
}

// Use a ref so the value can be changed reactively in tests
const mockCollectionsRef = ref<CollectionDisplay[]>([])

// Mock useMintNFT composable
const mockExecuteMint = vi.fn()
vi.mock('@/composables/useMintNFT', () => ({
  useMintNFT: () => ({
    executeMint: mockExecuteMint,
    isMinting: ref(false),
    error: ref(null),
    mintError: ref(null),
    ownerAddress: computed(() => 'client|user123456789012345678901234567890'),
    clearError: vi.fn(),
  }),
}))

// Mock useNFTMintAuthority composable - using the ref directly
vi.mock('@/composables/useNFTMintAuthority', () => ({
  useNFTMintAuthority: () => ({
    get authorizedCollections() {
      return mockCollectionsRef
    },
    get hasAnyMintAuthority() {
      return computed(() => mockCollectionsRef.value.length > 0)
    },
    getMintAllowanceRemaining: (collection: CollectionDisplay) => {
      if (collection.collectionKey === 'TestNFT|Character|Hero|') {
        return new BigNumber(40)
      }
      if (collection.collectionKey === 'OtherNFT|Item|Weapon|') {
        return new BigNumber(100)
      }
      return null
    },
    getMintAllowanceFormatted: (collection: CollectionDisplay) => {
      if (collection.collectionKey === 'TestNFT|Character|Hero|') {
        return '40'
      }
      if (collection.collectionKey === 'OtherNFT|Item|Weapon|') {
        return '100'
      }
      return null
    },
  }),
}))

describe('MintNFTModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    // Reset mock collections
    mockCollectionsRef.value = []
  })

  function mountComponent(props = {}) {
    // Mock dialog methods
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()

    return mount(MintNFTModal, {
      props: {
        open: false,
        ...props,
      },
      global: {
        stubs: {
          LoadingSpinner: true,
        },
      },
    })
  }

  describe('rendering', () => {
    it('should render dialog element', () => {
      mockCollectionsRef.value = [mockCollection]
      const wrapper = mountComponent()
      expect(wrapper.find('dialog').exists()).toBe(true)
    })

    it('should show "Mint NFT" title', () => {
      mockCollectionsRef.value = [mockCollection]
      const wrapper = mountComponent({ open: true })
      expect(wrapper.text()).toContain('Mint NFT')
    })

    it('should show no authority message when no collections available', () => {
      mockCollectionsRef.value = []
      const wrapper = mountComponent({ open: true })
      expect(wrapper.text()).toContain('No Mint Authority')
    })

    it('should show collection name when collection is available', () => {
      mockCollectionsRef.value = [mockCollection]
      const wrapper = mountComponent({ open: true })
      expect(wrapper.text()).toContain('Test Heroes')
    })

    // Note: Tests for mint allowance info, quantity input, and MAX button
    // require the selectedCollection to be properly initialized which happens
    // asynchronously when the dialog opens. These are tested via integration tests.
  })

  describe('dialog behavior', () => {
    it('should call showModal when open prop becomes true', async () => {
      mockCollectionsRef.value = [mockCollection]
      const wrapper = mountComponent({ open: false })
      await wrapper.setProps({ open: true })
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
    })
  })

  describe('buttons', () => {
    it('should show Continue button when collection is selected', () => {
      mockCollectionsRef.value = [mockCollection]
      const wrapper = mountComponent({ open: true })

      const continueButton = wrapper.findAll('button').find((btn) => btn.text() === 'Continue')
      expect(continueButton).toBeDefined()
    })

    it('should show Close button when no collections available', () => {
      mockCollectionsRef.value = []
      const wrapper = mountComponent({ open: true })

      const closeButton = wrapper.findAll('button').find((btn) => btn.text() === 'Close')
      expect(closeButton).toBeDefined()
    })

    it('should emit close when Close button clicked (no authority)', async () => {
      mockCollectionsRef.value = []
      const wrapper = mountComponent({ open: true })

      const closeButton = wrapper.findAll('button').find((btn) => btn.text() === 'Close')
      expect(closeButton).toBeDefined()

      if (closeButton) {
        await closeButton.trigger('click')
        expect(wrapper.emitted('close')).toBeTruthy()
      }
    })

    it('should emit close when Cancel button clicked', async () => {
      mockCollectionsRef.value = [mockCollection]
      const wrapper = mountComponent({ open: true })

      const cancelButton = wrapper.findAll('button').find((btn) => btn.text() === 'Cancel')
      expect(cancelButton).toBeDefined()

      if (cancelButton) {
        await cancelButton.trigger('click')
        expect(wrapper.emitted('close')).toBeTruthy()
      }
    })
  })

  describe('collection selector', () => {
    it('should show select element when collections available', () => {
      mockCollectionsRef.value = [mockCollection]
      const wrapper = mountComponent({ open: true })

      const select = wrapper.find('select')
      expect(select.exists()).toBe(true)
    })

    it('should populate options with authorized collections', () => {
      mockCollectionsRef.value = [mockCollection, mockCollection2]
      const wrapper = mountComponent({ open: true })

      const options = wrapper.findAll('option')
      expect(options.length).toBe(2)
    })

    it('should disable selector when only one collection', () => {
      mockCollectionsRef.value = [mockCollection]
      const wrapper = mountComponent({ open: true })

      const select = wrapper.find('select')
      expect(select.attributes('disabled')).toBeDefined()
    })

    it('should enable selector when multiple collections', () => {
      mockCollectionsRef.value = [mockCollection, mockCollection2]
      const wrapper = mountComponent({ open: true })

      const select = wrapper.find('select')
      expect(select.attributes('disabled')).toBeUndefined()
    })
  })

  // Note: Quantity control tests require selectedCollection to be properly set
  // which happens asynchronously. These are tested via integration tests.
})
