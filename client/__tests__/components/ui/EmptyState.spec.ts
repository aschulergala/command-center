import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EmptyState from '@/components/ui/EmptyState.vue'

describe('EmptyState component', () => {
  it('should render title', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'No tokens found',
      },
    })

    expect(wrapper.text()).toContain('No tokens found')
  })

  it('should render description when provided', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'No tokens found',
        description: 'Connect your wallet to view tokens',
      },
    })

    expect(wrapper.text()).toContain('Connect your wallet to view tokens')
  })

  it('should not render description when not provided', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'No tokens found',
      },
    })

    const paragraphs = wrapper.findAll('p')
    // Should only have h3, no description paragraph
    expect(paragraphs.length).toBe(0)
  })

  it('should render tokens icon when icon prop is "tokens"', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'No tokens',
        icon: 'tokens',
      },
    })

    // Check for the coins icon SVG (uses path for coin drawing)
    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
    // The tokens icon has the coin path with "12 8c-1.657" pattern
    expect(svg.html()).toContain('M12 8c-1.657')
  })

  it('should render nfts icon when icon prop is "nfts"', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'No NFTs',
        icon: 'nfts',
      },
    })

    // Check for the image icon SVG
    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
  })

  it('should render collections icon when icon prop is "collections"', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'No collections',
        icon: 'collections',
      },
    })

    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
  })

  it('should render search icon when icon prop is "search"', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'No results',
        icon: 'search',
      },
    })

    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
  })

  it('should render error icon with red color when icon prop is "error"', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'Error occurred',
        icon: 'error',
      },
    })

    const svg = wrapper.find('svg')
    expect(svg.classes()).toContain('text-red-400')
  })

  it('should render default icon when no icon prop provided', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'Empty',
      },
    })

    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
  })

  it('should render action button when actionLabel provided', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'No tokens',
        actionLabel: 'Connect Wallet',
      },
    })

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Connect Wallet')
  })

  it('should emit action event when action button clicked', async () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'No tokens',
        actionLabel: 'Connect Wallet',
      },
    })

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.emitted('action')).toBeTruthy()
    expect(wrapper.emitted('action')?.length).toBe(1)
  })

  it('should not render action button when no actionLabel provided', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'No tokens',
      },
    })

    const button = wrapper.find('button')
    expect(button.exists()).toBe(false)
  })

  it('should render slot content', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'Empty',
      },
      slots: {
        default: '<div class="custom-slot">Custom content</div>',
      },
    })

    expect(wrapper.find('.custom-slot').exists()).toBe(true)
    expect(wrapper.text()).toContain('Custom content')
  })

  it('should have centered layout', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'Empty',
      },
    })

    const container = wrapper.find('.flex.flex-col')
    expect(container.classes()).toContain('items-center')
    expect(container.classes()).toContain('justify-center')
    expect(container.classes()).toContain('text-center')
  })

  it('should have correct styling for icon container', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'Empty',
        icon: 'tokens',
      },
    })

    const iconContainer = wrapper.find('.w-16.h-16')
    expect(iconContainer.classes()).toContain('rounded-full')
    expect(iconContainer.classes()).toContain('bg-gray-100')
  })
})
