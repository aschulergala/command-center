/**
 * Tests for CreateClassModal component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import CreateClassModal from '@/components/creators/CreateClassModal.vue'
import type { CreatorCollectionDisplay } from '@/stores/creatorCollections'

// Mock useManageClasses composable
const mockCreateClass = vi.fn()
const mockClearError = vi.fn()

vi.mock('@/composables/useManageClasses', () => ({
  useManageClasses: () => ({
    isCreating: { value: false },
    error: { value: null },
    createClass: mockCreateClass,
    clearError: mockClearError,
  }),
}))

describe('CreateClassModal', () => {
  const mockCollection: CreatorCollectionDisplay = {
    collectionKey: 'MyCollection|NFT|Weapon|',
    collection: 'MyCollection',
    category: 'NFT',
    type: 'Weapon',
    additionalKey: '',
    name: 'Weapons Collection',
    symbol: 'WPN',
    description: '',
    image: '',
    isNonFungible: true,
    maxSupply: '0',
    totalSupply: '0',
    totalBurned: '0',
    isAuthority: true,
    ownedCount: 0,
    mintAllowanceRaw: '1000',
    mintAllowanceFormatted: '1000',
    hasUnlimitedMint: false,
    classes: [],
    isExpanded: false,
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    // Mock HTMLDialogElement methods
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  it('renders modal title', () => {
    const wrapper = mount(CreateClassModal, {
      props: {
        open: true,
        collection: mockCollection,
      },
    })

    expect(wrapper.text()).toContain('Create Token Class')
  })

  it('shows collection name in header', () => {
    const wrapper = mount(CreateClassModal, {
      props: {
        open: true,
        collection: mockCollection,
      },
    })

    expect(wrapper.text()).toContain('Weapons Collection')
  })

  it('renders form fields', () => {
    const wrapper = mount(CreateClassModal, {
      props: {
        open: true,
        collection: mockCollection,
      },
    })

    expect(wrapper.find('#className').exists()).toBe(true)
    expect(wrapper.find('#additionalKey').exists()).toBe(true)
    expect(wrapper.find('#description').exists()).toBe(true)
    expect(wrapper.find('#image').exists()).toBe(true)
    expect(wrapper.find('#maxSupply').exists()).toBe(true)
    expect(wrapper.find('#rarity').exists()).toBe(true)
  })

  it('emits close when Cancel clicked', async () => {
    const wrapper = mount(CreateClassModal, {
      props: {
        open: true,
        collection: mockCollection,
      },
    })

    const cancelButton = wrapper.findAll('button').find(b => b.text() === 'Cancel')
    await cancelButton!.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close when X button clicked', async () => {
    const wrapper = mount(CreateClassModal, {
      props: {
        open: true,
        collection: mockCollection,
      },
    })

    const closeButton = wrapper.find('.modal-close')
    await closeButton.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('shows class key preview when additionalKey is entered', async () => {
    const wrapper = mount(CreateClassModal, {
      props: {
        open: true,
        collection: mockCollection,
      },
    })

    await wrapper.find('#additionalKey').setValue('sword')
    await flushPromises()

    expect(wrapper.text()).toContain('MyCollection|NFT|Weapon|sword')
  })

  it('Continue button is disabled when form is invalid', () => {
    const wrapper = mount(CreateClassModal, {
      props: {
        open: true,
        collection: mockCollection,
      },
    })

    const continueButton = wrapper.findAll('button').find(b => b.text() === 'Continue')
    expect(continueButton!.attributes('disabled')).toBeDefined()
  })

  it('has Continue button in form step', () => {
    const wrapper = mount(CreateClassModal, {
      props: {
        open: true,
        collection: mockCollection,
      },
    })

    // Should show Continue button in form step
    const continueButton = wrapper.findAll('button').find(b => b.text() === 'Continue')
    expect(continueButton).toBeDefined()
  })

  it('has Cancel button in form step', () => {
    const wrapper = mount(CreateClassModal, {
      props: {
        open: true,
        collection: mockCollection,
      },
    })

    const cancelButton = wrapper.findAll('button').find(b => b.text() === 'Cancel')
    expect(cancelButton).toBeDefined()
  })

  it('shows input fields for class properties', () => {
    const wrapper = mount(CreateClassModal, {
      props: {
        open: true,
        collection: mockCollection,
      },
    })

    // Should have all the form fields
    expect(wrapper.find('#className').exists()).toBe(true)
    expect(wrapper.find('#additionalKey').exists()).toBe(true)
    expect(wrapper.find('#description').exists()).toBe(true)
    expect(wrapper.find('#maxSupply').exists()).toBe(true)
    expect(wrapper.find('#rarity').exists()).toBe(true)
  })

  it('clears error when closing', async () => {
    const wrapper = mount(CreateClassModal, {
      props: {
        open: true,
        collection: mockCollection,
      },
    })

    const cancelButton = wrapper.findAll('button').find(b => b.text() === 'Cancel')
    await cancelButton!.trigger('click')

    expect(mockClearError).toHaveBeenCalled()
  })
})
