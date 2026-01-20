/**
 * Tests for CreateCollectionModal component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import CreateCollectionModal from '@/components/creators/CreateCollectionModal.vue'

// Mock composables
const mockExecuteCreate = vi.fn()
const mockClearError = vi.fn()
const mockGetCollectionKey = vi.fn((values) => {
  return `${values.collection || ''}|${values.category || ''}|${values.type || ''}|${values.additionalKey || 'none'}`
})

vi.mock('@/composables/useCreateCollection', () => ({
  useCreateCollection: () => ({
    executeCreate: mockExecuteCreate,
    isCreating: { value: false },
    error: { value: null },
    clearError: mockClearError,
    getCollectionKey: mockGetCollectionKey,
  }),
}))

describe('CreateCollectionModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockExecuteCreate.mockReset()

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
        plugins: [createTestingPinia({ stubActions: false })],
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

    it('should display Create Collection title when open', () => {
      const wrapper = mountComponent({ open: true })
      expect(wrapper.text()).toContain('Create Collection')
    })

    it('should have name input field', () => {
      const wrapper = mountComponent({ open: true })
      expect(wrapper.find('#name').exists()).toBe(true)
    })

    it('should have symbol input field', () => {
      const wrapper = mountComponent({ open: true })
      expect(wrapper.find('#symbol').exists()).toBe(true)
    })

    it('should have description textarea', () => {
      const wrapper = mountComponent({ open: true })
      expect(wrapper.find('#description').exists()).toBe(true)
    })

    it('should have image URL input', () => {
      const wrapper = mountComponent({ open: true })
      expect(wrapper.find('#image').exists()).toBe(true)
    })

    it('should have collection identifier inputs', () => {
      const wrapper = mountComponent({ open: true })
      expect(wrapper.find('#collection').exists()).toBe(true)
      expect(wrapper.find('#category').exists()).toBe(true)
      expect(wrapper.find('#type').exists()).toBe(true)
      expect(wrapper.find('#additionalKey').exists()).toBe(true)
    })

    it('should have token type selection buttons', () => {
      const wrapper = mountComponent({ open: true })
      const buttons = wrapper.findAll('button')
      const tokenTypeButtons = buttons.filter(b =>
        b.text().includes('NFT Collection') || b.text().includes('Fungible Token')
      )
      expect(tokenTypeButtons.length).toBe(2)
    })
  })

  describe('form fields', () => {
    it('should have default values', async () => {
      const wrapper = mountComponent({ open: true })
      await flushPromises()

      const categoryInput = wrapper.find('#category')
      expect((categoryInput.element as HTMLInputElement).value).toBe('Item')
    })

    it('should show advanced options when clicked', async () => {
      const wrapper = mountComponent({ open: true })

      const advancedButton = wrapper.findAll('button').find(b =>
        b.text().includes('Advanced Options')
      )
      expect(advancedButton).toBeDefined()

      await advancedButton?.trigger('click')
      await flushPromises()

      expect(wrapper.find('#maxSupply').exists()).toBe(true)
    })

    it('should show decimals field for fungible tokens', async () => {
      const wrapper = mountComponent({ open: true })

      // Click fungible token button
      const fungibleButton = wrapper.findAll('button').find(b =>
        b.text().includes('Fungible Token')
      )
      await fungibleButton?.trigger('click')
      await flushPromises()

      // Open advanced options
      const advancedButton = wrapper.findAll('button').find(b =>
        b.text().includes('Advanced Options')
      )
      await advancedButton?.trigger('click')
      await flushPromises()

      expect(wrapper.find('#decimals').exists()).toBe(true)
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

      // Find Cancel button in footer - use text content matching
      const buttons = wrapper.findAll('button')
      const cancelButton = buttons.find(b => b.text().trim() === 'Cancel')

      expect(cancelButton).toBeDefined()
    })

    it('should have close button in header', async () => {
      const wrapper = mountComponent({ open: true })
      await flushPromises()

      // Verify the close button exists in the header (button with X icon)
      const headerSection = wrapper.find('.border-b')
      expect(headerSection.exists()).toBe(true)

      // The header should contain a close button
      const buttons = headerSection.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('form validation', () => {
    it('should have Continue button disabled initially', async () => {
      const wrapper = mountComponent({ open: true })
      await flushPromises()

      const continueButton = wrapper.findAll('button').find(b =>
        b.text() === 'Continue'
      )

      expect(continueButton?.attributes('disabled')).toBeDefined()
    })
  })

  describe('collection key preview', () => {
    it('should show collection key preview', async () => {
      const wrapper = mountComponent({ open: true })
      await flushPromises()

      // The preview should show the template format initially
      expect(wrapper.text()).toMatch(/\|/g) // Should have pipe separators
    })
  })

  describe('token type selection', () => {
    it('should default to NFT Collection', async () => {
      const wrapper = mountComponent({ open: true })
      await flushPromises()

      const nftButton = wrapper.findAll('button').find(b =>
        b.text().includes('NFT Collection')
      )

      // NFT button should be selected (has primary color class)
      expect(nftButton?.classes()).toContain('border-gala-primary')
    })

    it('should switch to Fungible Token when clicked', async () => {
      const wrapper = mountComponent({ open: true })
      await flushPromises()

      const fungibleButton = wrapper.findAll('button').find(b =>
        b.text().includes('Fungible Token')
      )
      await fungibleButton?.trigger('click')
      await flushPromises()

      expect(fungibleButton?.classes()).toContain('border-gala-primary')
    })
  })

  describe('info notices', () => {
    it('should display basic information section', async () => {
      const wrapper = mountComponent({ open: true })
      await flushPromises()

      expect(wrapper.text()).toContain('Basic Information')
    })

    it('should display token identifiers section', async () => {
      const wrapper = mountComponent({ open: true })
      await flushPromises()

      expect(wrapper.text()).toContain('Token Identifiers')
    })

    it('should display token type options', async () => {
      const wrapper = mountComponent({ open: true })
      await flushPromises()

      expect(wrapper.text()).toContain('NFT Collection')
      expect(wrapper.text()).toContain('Fungible Token')
    })
  })
})
