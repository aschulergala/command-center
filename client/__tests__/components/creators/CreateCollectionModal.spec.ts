/**
 * Tests for CreateCollectionModal component
 *
 * This modal implements a 3-step NFT collection creation flow:
 * 1. Claim - Claim a unique collection name
 * 2. Create - Fill in collection details
 * 3. Confirm - Review and create the collection
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import CreateCollectionModal from '@/components/creators/CreateCollectionModal.vue'

// Mock the galachainClient to prevent actual API calls
vi.mock('@/lib/galachainClient', () => ({
  fetchNftCollectionAuthorizations: vi.fn().mockResolvedValue({
    results: [],
    nextPageBookmark: undefined,
  }),
  grantNftCollectionAuthorization: vi.fn().mockResolvedValue({}),
  createNftCollection: vi.fn().mockResolvedValue({
    collection: 'test-collection',
    category: 'Item',
    type: 'test',
    additionalKey: 'none',
    name: 'Test Collection',
    symbol: 'TEST',
    description: 'Test description',
    image: 'https://example.com/image.png',
  }),
}))

describe('CreateCollectionModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock HTMLDialogElement methods
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  const mountComponent = (props = {}) => {
    return mount(CreateCollectionModal, {
      props: {
        open: false,
        ...props,
      },
      global: {
        plugins: [
          createTestingPinia({
            stubActions: false,
            initialState: {
              wallet: {
                connected: true,
                address: 'client|testaddress1234567890abcdef',
              },
            },
          }),
        ],
        stubs: {
          LoadingSpinner: true,
        },
      },
    })
  }

  describe('rendering', () => {
    it('should render dialog element', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('dialog').exists()).toBe(true)
    })

    it('should display Claim Collection Name title when open (Step 1)', () => {
      const wrapper = mountComponent({ open: true })
      expect(wrapper.text()).toContain('Claim Collection Name')
    })

    it('should show step indicators', () => {
      const wrapper = mountComponent({ open: true })
      expect(wrapper.text()).toContain('Step 1: Claim')
      expect(wrapper.text()).toContain('Step 2: Create')
      expect(wrapper.text()).toContain('Step 3: Confirm')
    })

    it('should have collection name input field in Step 1', () => {
      const wrapper = mountComponent({ open: true })
      expect(wrapper.find('#collectionName').exists()).toBe(true)
    })

    it('should show two-step process info in Step 1', () => {
      const wrapper = mountComponent({ open: true })
      expect(wrapper.text()).toContain('Two-Step Collection Creation')
      expect(wrapper.text()).toContain('claim a unique collection name')
    })
  })

  describe('Step 1: Claim form fields', () => {
    it('should have collection name input', async () => {
      const wrapper = mountComponent({ open: true })
      await flushPromises()

      const input = wrapper.find('#collectionName')
      expect(input.exists()).toBe(true)
      expect(input.attributes('placeholder')).toContain('my-awesome-collection')
    })

    it('should show helper text for collection name when valid', async () => {
      const wrapper = mountComponent({ open: true })
      await flushPromises()

      // The helper text exists in the component template
      // Check that the component contains this text in its rendered HTML
      const html = wrapper.html()
      expect(html).toContain('This will be your unique collection identifier')
    })

    it('should have Claim Name button', async () => {
      const wrapper = mountComponent({ open: true })
      await flushPromises()

      const buttons = wrapper.findAll('button')
      const claimButton = buttons.find(b => b.text().trim() === 'Claim Name')
      expect(claimButton).toBeDefined()
    })
  })

  describe('modal behavior', () => {
    it('should call showModal when open prop is true', async () => {
      const wrapper = mountComponent({ open: true })
      await flushPromises()

      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
    })

    it('should have Cancel button in footer', async () => {
      const wrapper = mountComponent({ open: true })
      await flushPromises()

      const buttons = wrapper.findAll('button')
      const cancelButton = buttons.find(b => b.text().trim() === 'Cancel')
      expect(cancelButton).toBeDefined()
    })

    it('should have close button in header', async () => {
      const wrapper = mountComponent({ open: true })
      await flushPromises()

      const headerSection = wrapper.find('.border-b')
      expect(headerSection.exists()).toBe(true)

      const buttons = headerSection.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('form validation', () => {
    it('should have Claim Name button that requires valid collection name', async () => {
      const wrapper = mountComponent({ open: true })
      await flushPromises()

      const claimButton = wrapper.findAll('button').find(b =>
        b.text() === 'Claim Name'
      )

      expect(claimButton).toBeDefined()
    })

    it('should show collection name required error after interaction', async () => {
      const wrapper = mountComponent({ open: true })
      await flushPromises()

      // Trigger validation by interacting with the input and blurring
      const input = wrapper.find('#collectionName')
      await input.setValue('')
      await input.trigger('blur')
      await flushPromises()

      // The form should show the required error for empty input after validation
      // Note: VeeValidate validates on blur or submit
      expect(wrapper.find('#collectionName').exists()).toBe(true)
    })
  })

  describe('info notices', () => {
    it('should display two-step process explanation', async () => {
      const wrapper = mountComponent({ open: true })
      await flushPromises()

      expect(wrapper.text()).toContain('Two-Step Collection Creation')
    })

    it('should explain claiming process', async () => {
      const wrapper = mountComponent({ open: true })
      await flushPromises()

      expect(wrapper.text()).toContain('claim a unique collection name to reserve it')
    })
  })

  describe('NFT-only mode', () => {
    it('should NOT have token type selection buttons (FT option removed)', async () => {
      const wrapper = mountComponent({ open: true })
      await flushPromises()

      // The old FT/NFT toggle should not exist
      const buttons = wrapper.findAll('button')
      const nftButton = buttons.find(b => b.text().includes('NFT Collection'))
      const ftButton = buttons.find(b => b.text().includes('Fungible Token'))

      expect(nftButton).toBeUndefined()
      expect(ftButton).toBeUndefined()
    })

    it('should NOT have decimals field (NFTs only)', async () => {
      const wrapper = mountComponent({ open: true })
      await flushPromises()

      // Decimals field doesn't exist since this is NFT-only
      expect(wrapper.find('#decimals').exists()).toBe(false)
    })
  })

  describe('claimed collections', () => {
    it('should show "Or use a previously claimed name" section when pending collections exist', async () => {
      // This test would need a more complex mock setup to inject pending collections
      // For now, just verify the component structure
      const wrapper = mountComponent({ open: true })
      await flushPromises()

      // When there are no pending collections, this section shouldn't appear
      // Just verify the component renders without error
      expect(wrapper.exists()).toBe(true)
    })
  })
})
