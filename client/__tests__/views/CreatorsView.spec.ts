/**
 * Tests for CreatorsView.vue
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { ref, computed } from 'vue'
import CreatorsView from '@/views/CreatorsView.vue'

// Mock connected ref that can be changed between tests
const mockConnected = ref(false)

// Mock useCreatorCollections data
const mockCollections = ref<any[]>([])
const mockIsLoading = ref(false)
const mockError = ref<string | null>(null)
const mockHasCollections = computed(() => mockCollections.value.length > 0)
const mockTotalCollectionCount = computed(() => mockCollections.value.length)
const mockFetchCollections = vi.fn()
const mockRefresh = vi.fn()
const mockToggleExpanded = vi.fn()

// Mock the useWallet composable
vi.mock('@/composables/useWallet', () => ({
  useWallet: vi.fn(() => ({
    connected: mockConnected
  }))
}))

// Mock the useCreatorCollections composable
vi.mock('@/composables/useCreatorCollections', () => ({
  useCreatorCollections: vi.fn(() => ({
    collections: mockCollections,
    isLoading: mockIsLoading,
    error: mockError,
    hasCollections: mockHasCollections,
    totalCollectionCount: mockTotalCollectionCount,
    fetchCollections: mockFetchCollections,
    refresh: mockRefresh,
    toggleExpanded: mockToggleExpanded,
  }))
}))

describe('CreatorsView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConnected.value = false
    mockCollections.value = []
    mockIsLoading.value = false
    mockError.value = null
  })

  describe('when wallet is not connected', () => {
    beforeEach(() => {
      mockConnected.value = false
    })

    it('renders the page header', () => {
      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      expect(wrapper.findComponent({ name: 'PageHeader' }).exists()).toBe(true)
    })

    it('renders empty state prompting wallet connection', () => {
      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      const emptyState = wrapper.findComponent({ name: 'EmptyState' })
      expect(emptyState.exists()).toBe(true)
      expect(emptyState.props('title')).toBe('Connect Your Wallet')
      expect(emptyState.props('icon')).toBe('collections')
    })

    it('does not render Pump section', () => {
      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      expect(wrapper.find('.pump-section').exists()).toBe(false)
    })

    it('does not render NFT tools section', () => {
      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      expect(wrapper.find('.nft-tools-section').exists()).toBe(false)
    })
  })

  describe('when wallet is connected', () => {
    beforeEach(() => {
      mockConnected.value = true
    })

    it('renders Pump section', () => {
      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      expect(wrapper.find('.pump-section').exists()).toBe(true)
    })

    it('renders PumpEntry component', () => {
      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      expect(wrapper.findComponent({ name: 'PumpEntry' }).exists()).toBe(true)
    })

    it('renders visual divider with NFT Collection Tools text', () => {
      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      const divider = wrapper.find('.divider')
      expect(divider.exists()).toBe(true)
      expect(divider.text()).toContain('NFT Collection Tools')
    })

    it('renders NFT tools section', () => {
      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      expect(wrapper.find('.nft-tools-section').exists()).toBe(true)
    })

    it('renders Create Collection card', () => {
      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      expect(wrapper.text()).toContain('Create Collection')
      expect(wrapper.text()).toContain('Start a new NFT collection')
    })

    it('renders Manage Classes card', () => {
      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      expect(wrapper.text()).toContain('Manage Classes')
      expect(wrapper.text()).toContain('Define token classes')
    })

    it('renders My Collections section', () => {
      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      expect(wrapper.text()).toContain('My Collections')
    })

    it('renders CollectionList component', () => {
      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      expect(wrapper.findComponent({ name: 'CollectionList' }).exists()).toBe(true)
    })

    it('has Create Collection button (enabled)', () => {
      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
            CreateCollectionModal: true,
          }
        }
      })

      const buttons = wrapper.findAll('button')
      const createButton = buttons.find(b => b.text().includes('Create New'))

      expect(createButton).toBeDefined()
      // The Create Collection button is now enabled (not disabled)
      expect(createButton?.attributes('disabled')).toBeUndefined()
    })

    it('has Manage Classes button (disabled)', () => {
      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      const buttons = wrapper.findAll('button')
      const manageButton = buttons.find(b => b.text().includes('Manage'))

      expect(manageButton).toBeDefined()
      expect(manageButton?.attributes('disabled')).toBeDefined()
    })

    it('does not render wallet connection empty state', () => {
      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      // EmptyState should not exist with "Connect Your Wallet" title
      const emptyState = wrapper.findComponent({ name: 'EmptyState' })
      expect(emptyState.exists()).toBe(false)
    })

    it('renders refresh button', () => {
      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      const buttons = wrapper.findAll('button')
      const refreshButton = buttons.find(b => b.text().includes('Refresh'))

      expect(refreshButton).toBeDefined()
    })
  })

  describe('collection count badge', () => {
    beforeEach(() => {
      mockConnected.value = true
    })

    it('shows collection count badge when has collections', () => {
      mockCollections.value = [
        { collectionKey: 'test1', name: 'Test1' },
        { collectionKey: 'test2', name: 'Test2' },
      ]

      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      expect(wrapper.text()).toContain('2')
    })

    it('does not show count badge when no collections', () => {
      mockCollections.value = []

      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      // Should only have "My Collections" text without a count badge
      const allH3s = wrapper.findAll('h3')
      const myCollectionsHeader = allH3s.find(h3 => h3.text() === 'My Collections')
      expect(myCollectionsHeader).toBeDefined()
      expect(myCollectionsHeader?.text()).toBe('My Collections')
    })
  })

  describe('error handling', () => {
    beforeEach(() => {
      mockConnected.value = true
    })

    it('displays error message when error is set', () => {
      mockError.value = 'Failed to load collections'

      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      expect(wrapper.text()).toContain('Failed to load collections')
    })

    it('shows try again button on error', () => {
      mockError.value = 'Some error'

      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      expect(wrapper.text()).toContain('Try again')
    })

    it('does not show error section when no error', () => {
      mockError.value = null

      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      expect(wrapper.text()).not.toContain('Failed to load collections')
    })
  })

  describe('loading state', () => {
    beforeEach(() => {
      mockConnected.value = true
    })

    it('shows LoadingSpinner when loading', () => {
      mockIsLoading.value = true

      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      expect(wrapper.findComponent({ name: 'LoadingSpinner' }).exists()).toBe(true)
    })

    it('disables refresh button when loading', () => {
      mockIsLoading.value = true

      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      const buttons = wrapper.findAll('button')
      const refreshButton = buttons.find(b => b.text().includes('Refresh'))
      expect(refreshButton?.attributes('disabled')).toBeDefined()
    })
  })

  describe('page structure', () => {
    beforeEach(() => {
      mockConnected.value = true
    })

    it('has two-column grid for NFT tools cards', () => {
      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      const grid = wrapper.find('.nft-tools-section .grid')
      expect(grid.exists()).toBe(true)
      expect(grid.classes()).toContain('md:grid-cols-2')
    })

    it('renders NFT tool cards with hover effects', () => {
      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true,
            CollectionList: true,
            LoadingSpinner: true,
          }
        }
      })

      const cards = wrapper.findAll('.nft-tools-section .card')
      expect(cards.length).toBe(2) // Create Collection, Manage Classes

      // Check that the tool cards have hover effects
      const toolCards = cards.filter(c => c.classes().includes('hover:shadow-md'))
      expect(toolCards.length).toBe(2)
    })
  })
})
