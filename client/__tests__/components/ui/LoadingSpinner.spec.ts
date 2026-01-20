import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

describe('LoadingSpinner component', () => {
  it('should render with default medium size', () => {
    const wrapper = mount(LoadingSpinner)

    const svg = wrapper.find('svg')
    expect(svg.classes()).toContain('w-8')
    expect(svg.classes()).toContain('h-8')
  })

  it('should render small size when prop is sm', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        size: 'sm',
      },
    })

    const svg = wrapper.find('svg')
    expect(svg.classes()).toContain('w-4')
    expect(svg.classes()).toContain('h-4')
  })

  it('should render large size when prop is lg', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        size: 'lg',
      },
    })

    const svg = wrapper.find('svg')
    expect(svg.classes()).toContain('w-12')
    expect(svg.classes()).toContain('h-12')
  })

  it('should have animation class', () => {
    const wrapper = mount(LoadingSpinner)

    const svg = wrapper.find('svg')
    expect(svg.classes()).toContain('animate-spin')
  })

  it('should have gala-primary color', () => {
    const wrapper = mount(LoadingSpinner)

    const svg = wrapper.find('svg')
    expect(svg.classes()).toContain('text-gala-primary')
  })

  it('should render label when provided', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        label: 'Loading tokens...',
      },
    })

    expect(wrapper.text()).toContain('Loading tokens...')
  })

  it('should not render label when not provided', () => {
    const wrapper = mount(LoadingSpinner)

    const span = wrapper.find('span')
    expect(span.exists()).toBe(false)
  })

  it('should have correct aria attributes for accessibility', () => {
    const wrapper = mount(LoadingSpinner)

    const container = wrapper.find('[role="status"]')
    expect(container.exists()).toBe(true)
    expect(container.attributes('aria-label')).toBe('Loading')
  })
})
