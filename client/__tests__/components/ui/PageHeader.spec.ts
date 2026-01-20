import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PageHeader from '@/components/ui/PageHeader.vue'

describe('PageHeader component', () => {
  it('should render title', () => {
    const wrapper = mount(PageHeader, {
      props: {
        title: 'Test Title',
      },
    })

    expect(wrapper.text()).toContain('Test Title')
  })

  it('should render title with correct styling', () => {
    const wrapper = mount(PageHeader, {
      props: {
        title: 'Tokens',
      },
    })

    const h1 = wrapper.find('h1')
    expect(h1.exists()).toBe(true)
    expect(h1.classes()).toContain('text-2xl')
    expect(h1.classes()).toContain('font-bold')
    expect(h1.classes()).toContain('text-gray-900')
  })

  it('should render description when provided', () => {
    const wrapper = mount(PageHeader, {
      props: {
        title: 'Test Title',
        description: 'This is a description',
      },
    })

    expect(wrapper.text()).toContain('This is a description')
  })

  it('should not render description element when not provided', () => {
    const wrapper = mount(PageHeader, {
      props: {
        title: 'Test Title',
      },
    })

    const p = wrapper.find('p')
    expect(p.exists()).toBe(false)
  })

  it('should render actions slot content', () => {
    const wrapper = mount(PageHeader, {
      props: {
        title: 'Test Title',
      },
      slots: {
        actions: '<button class="test-action">Action Button</button>',
      },
    })

    expect(wrapper.find('.test-action').exists()).toBe(true)
    expect(wrapper.text()).toContain('Action Button')
  })

  it('should have bottom margin for spacing', () => {
    const wrapper = mount(PageHeader, {
      props: {
        title: 'Test Title',
      },
    })

    const container = wrapper.find('div')
    expect(container.classes()).toContain('mb-6')
  })
})
