import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory } from 'vue-router'
import MobileMenu from '@/components/ui/MobileMenu.vue'

// Create a basic router for tests
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/tokens' },
    { path: '/tokens', component: { template: '<div>Tokens</div>' } },
    { path: '/nfts', component: { template: '<div>NFTs</div>' } },
    { path: '/creators', component: { template: '<div>Creators</div>' } },
    { path: '/export', component: { template: '<div>Export</div>' } },
  ],
})

describe('MobileMenu', () => {
  beforeEach(async () => {
    await router.push('/tokens')
    await router.isReady()
  })

  afterEach(() => {
    // Reset body overflow style
    document.body.style.overflow = ''
  })

  const mountMobileMenu = (props: { open: boolean } = { open: false }) => {
    return mount(MobileMenu, {
      props,
      global: {
        plugins: [createTestingPinia(), router],
        stubs: {
          Teleport: true, // Stub Teleport for testing
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders nothing when closed', () => {
      const wrapper = mountMobileMenu({ open: false })
      expect(wrapper.find('[role="navigation"]').exists()).toBe(false)
    })

    it('renders navigation when open', () => {
      const wrapper = mountMobileMenu({ open: true })
      expect(wrapper.find('[role="navigation"]').exists()).toBe(true)
    })

    it('renders all navigation items', () => {
      const wrapper = mountMobileMenu({ open: true })
      const links = wrapper.findAll('a')
      expect(links.length).toBe(4) // Tokens, NFTs, Creators, Export
    })

    it('renders navigation item names', () => {
      const wrapper = mountMobileMenu({ open: true })
      expect(wrapper.text()).toContain('Tokens')
      expect(wrapper.text()).toContain('NFTs')
      expect(wrapper.text()).toContain('Creators')
      expect(wrapper.text()).toContain('Export')
    })

    it('shows "Soon" badge on Export item', () => {
      const wrapper = mountMobileMenu({ open: true })
      const badges = wrapper.findAll('span').filter(s => s.text() === 'Soon')
      expect(badges.length).toBe(1)
    })

    it('renders descriptions for each item', () => {
      const wrapper = mountMobileMenu({ open: true })
      expect(wrapper.text()).toContain('View and manage your fungible tokens')
      expect(wrapper.text()).toContain('Browse and transfer your NFT collection')
      expect(wrapper.text()).toContain('Create and manage token collections')
      expect(wrapper.text()).toContain('Export your wallet activity')
    })

    it('renders close button', () => {
      const wrapper = mountMobileMenu({ open: true })
      const closeButton = wrapper.find('button[aria-label="Close menu"]')
      expect(closeButton.exists()).toBe(true)
    })

    it('renders menu header with logo', () => {
      const wrapper = mountMobileMenu({ open: true })
      expect(wrapper.text()).toContain('Menu')
      expect(wrapper.find('.bg-gradient-to-br').exists()).toBe(true)
    })

    it('renders footer', () => {
      const wrapper = mountMobileMenu({ open: true })
      expect(wrapper.text()).toContain('GalaChain Command Center')
    })
  })

  describe('active state', () => {
    it('highlights active route', async () => {
      await router.push('/tokens')
      await flushPromises()

      const wrapper = mountMobileMenu({ open: true })
      const tokensLink = wrapper.find('a[href="/tokens"]')
      expect(tokensLink.classes()).toContain('bg-gala-light')
      expect(tokensLink.classes()).toContain('text-gala-primary')
    })

    it('shows checkmark on active item', async () => {
      await router.push('/tokens')
      await flushPromises()

      const wrapper = mountMobileMenu({ open: true })
      // The checkmark SVG should be present in the active item
      const tokensLink = wrapper.find('a[href="/tokens"]')
      const checkmark = tokensLink.find('svg path[d*="M5 13l4 4L19 7"]')
      expect(checkmark.exists()).toBe(true)
    })

    it('does not highlight inactive routes', async () => {
      await router.push('/tokens')
      await flushPromises()

      const wrapper = mountMobileMenu({ open: true })
      const nftsLink = wrapper.find('a[href="/nfts"]')
      expect(nftsLink.classes()).toContain('text-gray-700')
      expect(nftsLink.classes()).not.toContain('bg-gala-light')
    })
  })

  describe('interactions', () => {
    it('emits close when close button clicked', async () => {
      const wrapper = mountMobileMenu({ open: true })
      const closeButton = wrapper.find('button[aria-label="Close menu"]')
      await closeButton.trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('emits close when backdrop clicked', async () => {
      const wrapper = mountMobileMenu({ open: true })
      const backdrop = wrapper.find('.bg-black\\/50')
      await backdrop.trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('emits close when ESC key pressed', async () => {
      const wrapper = mountMobileMenu({ open: true })

      // Simulate ESC key press
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      await flushPromises()

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('emits close on route change', async () => {
      const wrapper = mountMobileMenu({ open: true })

      await router.push('/nfts')
      await flushPromises()

      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })

  describe('body scroll lock', () => {
    it('locks body scroll when opened via prop change', async () => {
      // Start closed, then open - this triggers the watcher
      const wrapper = mountMobileMenu({ open: false })
      await flushPromises()
      expect(document.body.style.overflow).toBe('')

      await wrapper.setProps({ open: true })
      await flushPromises()
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('unlocks body scroll when closed', async () => {
      // Start closed, open, then close
      const wrapper = mountMobileMenu({ open: false })
      await flushPromises()

      await wrapper.setProps({ open: true })
      await flushPromises()
      expect(document.body.style.overflow).toBe('hidden')

      await wrapper.setProps({ open: false })
      await flushPromises()
      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('touch targets', () => {
    it('close button has minimum touch target size', () => {
      const wrapper = mountMobileMenu({ open: true })
      const closeButton = wrapper.find('button[aria-label="Close menu"]')
      expect(closeButton.classes()).toContain('min-h-[44px]')
      expect(closeButton.classes()).toContain('min-w-[44px]')
    })

    it('navigation items have touch-target class', () => {
      const wrapper = mountMobileMenu({ open: true })
      const links = wrapper.findAll('a')
      links.forEach(link => {
        expect(link.classes()).toContain('touch-target')
      })
    })
  })

  describe('accessibility', () => {
    it('has navigation role', () => {
      const wrapper = mountMobileMenu({ open: true })
      expect(wrapper.find('nav[role="navigation"]').exists()).toBe(true)
    })

    it('has aria-label on navigation', () => {
      const wrapper = mountMobileMenu({ open: true })
      expect(wrapper.find('nav[aria-label="Mobile navigation"]').exists()).toBe(true)
    })

    it('close button has aria-label', () => {
      const wrapper = mountMobileMenu({ open: true })
      expect(wrapper.find('button[aria-label="Close menu"]').exists()).toBe(true)
    })
  })
})
