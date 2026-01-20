import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import ExportComingSoon from '@/components/export/ExportComingSoon.vue'

describe('ExportComingSoon', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const mountComponent = () => {
    return mount(ExportComingSoon)
  }

  describe('Rendering', () => {
    it('renders the Coming Soon badge', () => {
      wrapper = mountComponent()
      expect(wrapper.text()).toContain('Coming Soon')
    })

    it('renders the main heading', () => {
      wrapper = mountComponent()
      expect(wrapper.text()).toContain('Export Wallet Activity')
    })

    it('renders the description text', () => {
      wrapper = mountComponent()
      expect(wrapper.text()).toContain('Export your complete transaction history to CSV format')
    })

    it('renders the export preview mockup section', () => {
      wrapper = mountComponent()
      expect(wrapper.text()).toContain('Export Preview')
    })

    it('renders date range filter mockup', () => {
      wrapper = mountComponent()
      expect(wrapper.text()).toContain('Date Range')
      expect(wrapper.text()).toContain('Start Date')
      expect(wrapper.text()).toContain('End Date')
    })

    it('renders token type filter mockup', () => {
      wrapper = mountComponent()
      expect(wrapper.text()).toContain('Token Types')
      expect(wrapper.text()).toContain('Fungible Tokens')
      expect(wrapper.text()).toContain('NFTs')
    })

    it('renders transaction types filter mockup', () => {
      wrapper = mountComponent()
      expect(wrapper.text()).toContain('Transaction Types')
      expect(wrapper.text()).toContain('Transfers')
      expect(wrapper.text()).toContain('Mints')
      expect(wrapper.text()).toContain('Burns')
    })

    it('renders disabled export button', () => {
      wrapper = mountComponent()
      const exportButton = wrapper.find('button[disabled]')
      expect(exportButton.exists()).toBe(true)
      expect(exportButton.text()).toContain('Export to CSV')
    })
  })

  describe('Planned Features', () => {
    it('renders planned features section', () => {
      wrapper = mountComponent()
      expect(wrapper.text()).toContain('Planned Features')
    })

    it('lists date range filters feature', () => {
      wrapper = mountComponent()
      expect(wrapper.text()).toContain('Date Range Filters')
    })

    it('lists FT/NFT selection feature', () => {
      wrapper = mountComponent()
      expect(wrapper.text()).toContain('FT/NFT Selection')
    })

    it('lists CSV download feature', () => {
      wrapper = mountComponent()
      expect(wrapper.text()).toContain('CSV Download')
    })

    it('lists transaction history feature', () => {
      wrapper = mountComponent()
      expect(wrapper.text()).toContain('Transaction History')
    })
  })

  describe('Email Notification Signup', () => {
    it('renders notification signup section', () => {
      wrapper = mountComponent()
      expect(wrapper.text()).toContain('Get Notified')
    })

    it('renders email input field', () => {
      wrapper = mountComponent()
      const emailInput = wrapper.find('input[type="email"]')
      expect(emailInput.exists()).toBe(true)
      expect(emailInput.attributes('placeholder')).toBe('your@email.com')
    })

    it('renders notify me button', () => {
      wrapper = mountComponent()
      const notifyButton = wrapper.findAll('button').find(btn => btn.text().includes('Notify Me'))
      expect(notifyButton).toBeDefined()
    })

    it('shows error for invalid email', async () => {
      wrapper = mountComponent()
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('invalid-email')

      const notifyButton = wrapper.findAll('button').find(btn => btn.text().includes('Notify Me'))
      await notifyButton!.trigger('click')

      expect(wrapper.text()).toContain('Please enter a valid email address')
    })

    it('shows error for empty email', async () => {
      wrapper = mountComponent()
      const notifyButton = wrapper.findAll('button').find(btn => btn.text().includes('Notify Me'))
      await notifyButton!.trigger('click')

      expect(wrapper.text()).toContain('Please enter a valid email address')
    })

    it('shows submitting state when submitting', async () => {
      wrapper = mountComponent()
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('test@example.com')

      const notifyButton = wrapper.findAll('button').find(btn => btn.text().includes('Notify Me'))
      await notifyButton!.trigger('click')

      expect(wrapper.text()).toContain('Submitting...')
    })

    it('shows success message after submission', async () => {
      wrapper = mountComponent()
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('test@example.com')

      const notifyButton = wrapper.findAll('button').find(btn => btn.text().includes('Notify Me'))
      await notifyButton!.trigger('click')

      // Advance timer to complete the simulated submission
      await vi.advanceTimersByTimeAsync(500)

      expect(wrapper.text()).toContain("Thanks! We'll notify you when export is available.")
    })

    it('hides email input after successful submission', async () => {
      wrapper = mountComponent()
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('test@example.com')

      const notifyButton = wrapper.findAll('button').find(btn => btn.text().includes('Notify Me'))
      await notifyButton!.trigger('click')

      await vi.advanceTimersByTimeAsync(500)

      expect(wrapper.find('input[type="email"]').exists()).toBe(false)
    })
  })

  describe('Styling', () => {
    it('applies muted/gray styling to mockup elements', () => {
      wrapper = mountComponent()
      // Check for gray-themed classes on the component
      expect(wrapper.html()).toContain('text-gray-')
      expect(wrapper.html()).toContain('bg-gray-')
    })

    it('has disabled styling on mockup form elements', () => {
      wrapper = mountComponent()
      expect(wrapper.html()).toContain('cursor-not-allowed')
    })

    it('applies opacity to preview mockup', () => {
      wrapper = mountComponent()
      expect(wrapper.html()).toContain('opacity-75')
    })
  })
})
