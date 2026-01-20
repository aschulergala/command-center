import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import AppNavigation from '@/components/AppNavigation.vue'

// Create a router for testing
function createTestRouter(initialRoute = '/tokens') {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', redirect: '/tokens' },
      { path: '/tokens', name: 'tokens', component: { template: '<div>Tokens</div>' } },
      { path: '/nfts', name: 'nfts', component: { template: '<div>NFTs</div>' } },
      { path: '/creators', name: 'creators', component: { template: '<div>Creators</div>' } },
      { path: '/export', name: 'export', component: { template: '<div>Export</div>' } },
    ],
  })
  router.push(initialRoute)
  return router
}

describe('AppNavigation component', () => {
  describe('desktop navigation', () => {
    it('should render all navigation items', async () => {
      const router = createTestRouter()
      await router.isReady()

      const wrapper = mount(AppNavigation, {
        global: {
          plugins: [router],
        },
      })

      expect(wrapper.text()).toContain('Tokens')
      expect(wrapper.text()).toContain('NFTs')
      expect(wrapper.text()).toContain('Creators')
      expect(wrapper.text()).toContain('Export')
    })

    it('should highlight active route', async () => {
      const router = createTestRouter('/tokens')
      await router.isReady()

      const wrapper = mount(AppNavigation, {
        global: {
          plugins: [router],
        },
      })

      const links = wrapper.findAll('a')
      const tokensLink = links.find(link => link.text().includes('Tokens'))
      expect(tokensLink?.classes()).toContain('text-gala-primary')
      expect(tokensLink?.classes()).toContain('bg-gala-light')
    })

    it('should show "Soon" badge on Export tab', async () => {
      const router = createTestRouter()
      await router.isReady()

      const wrapper = mount(AppNavigation, {
        global: {
          plugins: [router],
        },
      })

      expect(wrapper.text()).toContain('Soon')
    })

    it('should highlight NFTs when on /nfts route', async () => {
      const router = createTestRouter('/nfts')
      await router.isReady()

      const wrapper = mount(AppNavigation, {
        global: {
          plugins: [router],
        },
      })

      const links = wrapper.findAll('a')
      const nftsLink = links.find(link => link.text().includes('NFTs'))
      expect(nftsLink?.classes()).toContain('text-gala-primary')
    })

    it('should highlight Creators when on /creators route', async () => {
      const router = createTestRouter('/creators')
      await router.isReady()

      const wrapper = mount(AppNavigation, {
        global: {
          plugins: [router],
        },
      })

      const links = wrapper.findAll('a')
      const creatorsLink = links.find(link => link.text().includes('Creators'))
      expect(creatorsLink?.classes()).toContain('text-gala-primary')
    })

    it('should have correct link hrefs for navigation', async () => {
      const router = createTestRouter('/tokens')
      await router.isReady()

      const wrapper = mount(AppNavigation, {
        global: {
          plugins: [router],
        },
      })

      const links = wrapper.findAll('a')
      const nftsLink = links.find(link => link.text().includes('NFTs'))

      // Verify the link has the correct href attribute
      expect(nftsLink?.attributes('href')).toBe('/nfts')
    })
  })

  describe('mobile navigation', () => {
    it('should render mobile navigation when mobile prop is true', async () => {
      const router = createTestRouter()
      await router.isReady()

      const wrapper = mount(AppNavigation, {
        props: {
          mobile: true,
        },
        global: {
          plugins: [router],
        },
      })

      // Mobile nav should have scrollbar-hide class
      const nav = wrapper.find('nav')
      expect(nav.classes()).toContain('scrollbar-hide')
    })

    it('should show nav items without icons on mobile', async () => {
      const router = createTestRouter()
      await router.isReady()

      const wrapper = mount(AppNavigation, {
        props: {
          mobile: true,
        },
        global: {
          plugins: [router],
        },
      })

      // Mobile should still show navigation items
      expect(wrapper.text()).toContain('Tokens')
      expect(wrapper.text()).toContain('NFTs')
      expect(wrapper.text()).toContain('Creators')
      expect(wrapper.text()).toContain('Export')
    })
  })

  describe('accessibility', () => {
    it('should have navigation role and aria-label', async () => {
      const router = createTestRouter()
      await router.isReady()

      const wrapper = mount(AppNavigation, {
        global: {
          plugins: [router],
        },
      })

      const nav = wrapper.find('nav')
      expect(nav.attributes('role')).toBe('navigation')
      expect(nav.attributes('aria-label')).toBe('Main navigation')
    })
  })
})
