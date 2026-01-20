import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { ref } from 'vue'
import CollectionMintModal from '@/components/creators/CollectionMintModal.vue'
import type { CreatorCollectionDisplay, CreatorClassDisplay } from '@/stores/creatorCollections'

// Mock HTMLDialogElement methods for jsdom
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn()
  HTMLDialogElement.prototype.close = vi.fn()
})

// Mock data
const mockCollection: CreatorCollectionDisplay = {
  collectionKey: 'TestColl|TestCat|TestType|TestKey',
  collection: 'TestColl',
  category: 'TestCat',
  type: 'TestType',
  additionalKey: 'TestKey',
  name: 'Test Collection',
  symbol: 'TEST',
  description: 'A test collection',
  image: '',
  isNonFungible: true,
  maxSupply: '1000',
  totalSupply: '500',
  totalBurned: '0',
  isAuthority: true,
  ownedCount: 10,
  mintAllowanceRaw: '50',
  mintAllowanceFormatted: '50',
  hasUnlimitedMint: false,
  classes: [],
  isExpanded: false,
}

const mockClass: CreatorClassDisplay = {
  classKey: 'TestColl|TestCat|TestType|ClassKey',
  collection: 'TestColl',
  category: 'TestCat',
  type: 'TestType',
  additionalKey: 'ClassKey',
  name: 'Test Class',
  maxSupply: '100',
  maxSupplyFormatted: '100',
  mintedCount: '30',
  mintedCountFormatted: '30',
  canMintMore: true,
}

const mockCollectionWithClasses: CreatorCollectionDisplay = {
  ...mockCollection,
  classes: [mockClass],
}

// Mock composable
const mockExecuteMintFromCollection = vi.fn()
const mockExecuteMintFromClass = vi.fn()
const mockIsMinting = ref(false)
const mockError = ref<string | null>(null)
const mockOwnerAddress = ref('client|test-address')
const mockClearError = vi.fn()

vi.mock('@/composables/useCollectionMint', () => ({
  useCollectionMint: () => ({
    executeMintFromCollection: mockExecuteMintFromCollection,
    executeMintFromClass: mockExecuteMintFromClass,
    isMinting: mockIsMinting,
    error: mockError,
    ownerAddress: mockOwnerAddress,
    clearError: mockClearError,
    getMaxMintableQuantity: (collection: CreatorCollectionDisplay) => {
      return Math.min(100, parseInt(collection.mintAllowanceRaw, 10) || 0)
    },
    getMaxMintableQuantityForClass: (classItem: CreatorClassDisplay) => {
      const max = parseInt(classItem.maxSupply, 10) || 0
      if (max === 0) return 100
      const minted = parseInt(classItem.mintedCount, 10) || 0
      return Math.min(100, max - minted)
    },
  }),
}))

describe('CollectionMintModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsMinting.value = false
    mockError.value = null
    mockOwnerAddress.value = 'client|test-address'
    mockExecuteMintFromCollection.mockResolvedValue({ success: true, mintedInstances: [] })
    mockExecuteMintFromClass.mockResolvedValue({ success: true, mintedInstances: [] })
  })

  function mountModal(props: Partial<{
    open: boolean
    collection: CreatorCollectionDisplay | null
    selectedClass: CreatorClassDisplay | null
  }> = {}) {
    return mount(CollectionMintModal, {
      props: {
        open: true,
        collection: mockCollection,
        ...props,
      },
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          LoadingSpinner: true,
        },
      },
    })
  }

  describe('rendering', () => {
    it('should render modal when open', () => {
      const wrapper = mountModal()
      expect(wrapper.find('dialog').exists()).toBe(true)
    })

    it('should show no collection state when collection is null', () => {
      const wrapper = mountModal({ collection: null })
      expect(wrapper.text()).toContain('No Collection Selected')
    })

    it('should show collection info', () => {
      const wrapper = mountModal()
      expect(wrapper.text()).toContain('Test Collection')
    })

    it('should show mint allowance info', () => {
      const wrapper = mountModal()
      expect(wrapper.text()).toContain('Mint Allowance')
      expect(wrapper.text()).toContain('50')
    })

    it('should show quantity input', () => {
      const wrapper = mountModal()
      expect(wrapper.find('input#quantity').exists()).toBe(true)
    })
  })

  describe('class selector', () => {
    it('should not show class selector when collection has no classes', () => {
      const wrapper = mountModal()
      expect(wrapper.find('#class-select').exists()).toBe(false)
    })

    it('should show class selector when collection has classes', () => {
      const wrapper = mountModal({ collection: mockCollectionWithClasses })
      expect(wrapper.find('#class-select').exists()).toBe(true)
    })

    it('should have default option for collection level minting', () => {
      const wrapper = mountModal({ collection: mockCollectionWithClasses })
      const select = wrapper.find('#class-select')
      const options = select.findAll('option')
      expect(options[0].text()).toContain('Default')
    })
  })

  describe('quantity controls', () => {
    it('should have increment button', () => {
      const wrapper = mountModal()
      const buttons = wrapper.findAll('button')
      const incrementBtn = buttons.find(btn => btn.find('svg path[d*="M12 6v6"]').exists())
      expect(incrementBtn).toBeDefined()
    })

    it('should have decrement button', () => {
      const wrapper = mountModal()
      const buttons = wrapper.findAll('button')
      const decrementBtn = buttons.find(btn => btn.find('svg path[d="M20 12H4"]').exists())
      expect(decrementBtn).toBeDefined()
    })

    it('should have MAX button', () => {
      const wrapper = mountModal()
      expect(wrapper.text()).toContain('MAX')
    })
  })

  describe('form flow', () => {
    it('should show form view initially', () => {
      const wrapper = mountModal()
      expect(wrapper.text()).toContain('Quantity to Mint')
    })

    it('should have Continue button', () => {
      const wrapper = mountModal()
      const buttons = wrapper.findAll('button')
      const continueBtn = buttons.find(btn => btn.text().includes('Continue'))
      expect(continueBtn).toBeDefined()
    })

    it('should have Cancel button', () => {
      const wrapper = mountModal()
      const buttons = wrapper.findAll('button')
      const cancelBtn = buttons.find(btn => btn.text().includes('Cancel'))
      expect(cancelBtn).toBeDefined()
    })
  })

  describe('error handling', () => {
    it('should show error when mint fails', async () => {
      mockError.value = 'Mint failed: insufficient allowance'
      const wrapper = mountModal()
      await flushPromises()
      expect(wrapper.text()).toContain('Mint failed')
    })
  })

  describe('minting state', () => {
    it('should disable buttons when minting', async () => {
      mockIsMinting.value = true
      const wrapper = mountModal()
      await flushPromises()

      const cancelBtn = wrapper.findAll('button').find(btn => btn.text().includes('Cancel'))
      expect(cancelBtn?.attributes('disabled')).toBeDefined()
    })
  })

  describe('events', () => {
    it('should emit close when cancel clicked', async () => {
      const wrapper = mountModal()
      const cancelBtn = wrapper.findAll('button').find(btn => btn.text().includes('Cancel'))
      await cancelBtn?.trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should emit close when X button clicked', async () => {
      const wrapper = mountModal()
      // Find the close X button (in header)
      const headerBtns = wrapper.findAll('.border-b button')
      const closeBtn = headerBtns.find(btn => btn.find('path[d*="M6 18L18 6"]').exists())
      await closeBtn?.trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })

  describe('collection with image', () => {
    it('should display collection image when available', () => {
      const collectionWithImage = {
        ...mockCollection,
        image: 'https://example.com/image.png',
      }
      const wrapper = mountModal({ collection: collectionWithImage })
      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('https://example.com/image.png')
    })

    it('should display initials when no image', () => {
      const wrapper = mountModal()
      // Look for initials placeholder - should show "TC" for "Test Collection"
      expect(wrapper.text()).toContain('TC')
    })
  })

  describe('empty max quantity', () => {
    it('should disable Continue button when max quantity is 0', async () => {
      const emptyAllowanceCollection = {
        ...mockCollection,
        mintAllowanceRaw: '0',
        mintAllowanceFormatted: '0',
      }
      const wrapper = mountModal({ collection: emptyAllowanceCollection })
      await flushPromises()

      const continueBtn = wrapper.findAll('button').find(btn => btn.text().includes('Continue'))
      expect(continueBtn?.attributes('disabled')).toBeDefined()
    })
  })
})
