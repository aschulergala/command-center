/**
 * Tests for CreatorsView.vue
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { ref } from 'vue'
import CreatorsView from '@/views/CreatorsView.vue'

// Mock connected ref that can be changed between tests
const mockConnected = ref(false)

// Mock the useWallet composable
vi.mock('@/composables/useWallet', () => ({
  useWallet: vi.fn(() => ({
    connected: mockConnected
  }))
}))

describe('CreatorsView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConnected.value = false
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
            PumpEntry: true
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
            PumpEntry: true
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
            PumpEntry: true
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
            PumpEntry: true
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
            PumpEntry: true
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
            PumpEntry: true
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
            PumpEntry: true
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
            PumpEntry: true
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
            PumpEntry: true
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
            PumpEntry: true
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
            PumpEntry: true
          }
        }
      })

      expect(wrapper.text()).toContain('My Collections')
    })

    it('renders empty state for collections', () => {
      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true
          }
        }
      })

      expect(wrapper.text()).toContain('No Collections Yet')
      expect(wrapper.text()).toContain('Your created collections will appear here')
    })

    it('has Create Collection button (disabled)', () => {
      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true
          }
        }
      })

      const buttons = wrapper.findAll('button')
      const createButton = buttons.find(b => b.text().includes('Create New'))

      expect(createButton).toBeDefined()
      expect(createButton?.attributes('disabled')).toBeDefined()
    })

    it('has Manage Classes button (disabled)', () => {
      const wrapper = mount(CreatorsView, {
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            PageHeader: true,
            EmptyState: true,
            PumpEntry: true
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
            PumpEntry: true
          }
        }
      })

      // EmptyState should not exist with "Connect Your Wallet" title
      const emptyState = wrapper.findComponent({ name: 'EmptyState' })
      expect(emptyState.exists()).toBe(false)
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
            PumpEntry: true
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
            PumpEntry: true
          }
        }
      })

      const cards = wrapper.findAll('.nft-tools-section .card')
      expect(cards.length).toBe(3) // Create Collection, Manage Classes, empty state

      // Check that the tool cards have hover effects
      const toolCards = cards.filter(c => c.classes().includes('hover:shadow-md'))
      expect(toolCards.length).toBe(2)
    })
  })
})
