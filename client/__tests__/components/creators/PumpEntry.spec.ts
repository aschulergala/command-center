/**
 * Tests for PumpEntry.vue component
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PumpEntry from '@/components/creators/PumpEntry.vue'

describe('PumpEntry.vue', () => {
  describe('rendering', () => {
    it('renders the Pump Interface title', () => {
      const wrapper = mount(PumpEntry)

      expect(wrapper.text()).toContain('Pump Interface')
    })

    it('renders the description text', () => {
      const wrapper = mount(PumpEntry)

      expect(wrapper.text()).toContain('Launch your own token')
      expect(wrapper.text()).toContain('bonding curves')
    })

    it('renders feature list items', () => {
      const wrapper = mount(PumpEntry)

      expect(wrapper.text()).toContain('Bonding curves')
      expect(wrapper.text()).toContain('Custom parameters')
      expect(wrapper.text()).toContain('One-click deploy')
    })

    it('renders the Launch Tokens badge', () => {
      const wrapper = mount(PumpEntry)

      expect(wrapper.text()).toContain('Launch Tokens')
    })

    it('renders the pump icon', () => {
      const wrapper = mount(PumpEntry)

      const icon = wrapper.find('.pump-icon')
      expect(icon.exists()).toBe(true)
    })

    it('renders background decoration SVG', () => {
      const wrapper = mount(PumpEntry)

      const svg = wrapper.find('svg')
      expect(svg.exists()).toBe(true)
    })
  })

  describe('CTA button when enabled', () => {
    it('renders an anchor element when not disabled', () => {
      const wrapper = mount(PumpEntry, {
        props: { disabled: false }
      })

      const link = wrapper.find('a.pump-cta')
      expect(link.exists()).toBe(true)
    })

    it('links to pump.gala.com', () => {
      const wrapper = mount(PumpEntry, {
        props: { disabled: false }
      })

      const link = wrapper.find('a.pump-cta')
      expect(link.attributes('href')).toBe('https://pump.gala.com')
    })

    it('opens link in new tab', () => {
      const wrapper = mount(PumpEntry, {
        props: { disabled: false }
      })

      const link = wrapper.find('a.pump-cta')
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toContain('noopener')
    })

    it('displays "Launch a Token" text', () => {
      const wrapper = mount(PumpEntry, {
        props: { disabled: false }
      })

      const link = wrapper.find('a.pump-cta')
      expect(link.text()).toContain('Launch a Token')
    })

    it('has gradient styling classes', () => {
      const wrapper = mount(PumpEntry, {
        props: { disabled: false }
      })

      const link = wrapper.find('a.pump-cta')
      expect(link.classes()).toContain('bg-gradient-to-r')
    })

    it('emits click event when clicked', async () => {
      const wrapper = mount(PumpEntry, {
        props: { disabled: false }
      })

      const link = wrapper.find('a.pump-cta')
      await link.trigger('click')

      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')?.length).toBe(1)
    })
  })

  describe('CTA button when disabled', () => {
    it('renders a button element when disabled', () => {
      const wrapper = mount(PumpEntry, {
        props: { disabled: true }
      })

      const button = wrapper.find('button.pump-cta')
      expect(button.exists()).toBe(true)
    })

    it('has disabled attribute', () => {
      const wrapper = mount(PumpEntry, {
        props: { disabled: true }
      })

      const button = wrapper.find('button.pump-cta')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('has gray disabled styling', () => {
      const wrapper = mount(PumpEntry, {
        props: { disabled: true }
      })

      const button = wrapper.find('button.pump-cta')
      expect(button.classes()).toContain('bg-gray-100')
      expect(button.classes()).toContain('cursor-not-allowed')
    })

    it('displays "Launch a Token" text', () => {
      const wrapper = mount(PumpEntry, {
        props: { disabled: true }
      })

      const button = wrapper.find('button.pump-cta')
      expect(button.text()).toContain('Launch a Token')
    })

    it('does not render anchor element when disabled', () => {
      const wrapper = mount(PumpEntry, {
        props: { disabled: true }
      })

      const link = wrapper.find('a.pump-cta')
      expect(link.exists()).toBe(false)
    })
  })

  describe('default props', () => {
    it('defaults to not disabled', () => {
      const wrapper = mount(PumpEntry)

      // Should render anchor, not button
      const link = wrapper.find('a.pump-cta')
      const button = wrapper.find('button.pump-cta')

      expect(link.exists()).toBe(true)
      expect(button.exists()).toBe(false)
    })
  })

  describe('styling', () => {
    it('has gradient border container', () => {
      const wrapper = mount(PumpEntry)

      const container = wrapper.find('.pump-entry')
      expect(container.classes()).toContain('bg-gradient-to-br')
    })

    it('has white inner card', () => {
      const wrapper = mount(PumpEntry)

      const inner = wrapper.find('.pump-entry-inner')
      expect(inner.exists()).toBe(true)
      expect(inner.classes()).toContain('bg-white')
    })

    it('has rounded corners', () => {
      const wrapper = mount(PumpEntry)

      const container = wrapper.find('.pump-entry')
      expect(container.classes()).toContain('rounded-2xl')
    })
  })
})
