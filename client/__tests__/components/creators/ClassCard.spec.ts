/**
 * Tests for ClassCard component
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ClassCard from '@/components/creators/ClassCard.vue'
import type { CreatorClassDisplay } from '@/stores/creatorCollections'

describe('ClassCard', () => {
  const mockClass: CreatorClassDisplay = {
    classKey: 'MyCollection|NFT|Weapon|sword',
    collection: 'MyCollection',
    category: 'NFT',
    type: 'Weapon',
    additionalKey: 'sword',
    name: 'Legendary Sword',
    maxSupply: '100',
    maxSupplyFormatted: '100',
    mintedCount: '25',
    mintedCountFormatted: '25',
    canMintMore: true,
  }

  it('renders class name', () => {
    const wrapper = mount(ClassCard, {
      props: { classItem: mockClass },
    })

    expect(wrapper.text()).toContain('Legendary Sword')
  })

  it('renders additionalKey', () => {
    const wrapper = mount(ClassCard, {
      props: { classItem: mockClass },
    })

    expect(wrapper.text()).toContain('sword')
  })

  it('renders supply information', () => {
    const wrapper = mount(ClassCard, {
      props: { classItem: mockClass },
    })

    expect(wrapper.text()).toContain('25 / 100')
  })

  it('renders unlimited supply correctly', () => {
    const unlimitedClass: CreatorClassDisplay = {
      ...mockClass,
      maxSupply: '0',
      maxSupplyFormatted: '0',
    }

    const wrapper = mount(ClassCard, {
      props: { classItem: unlimitedClass },
    })

    expect(wrapper.text()).toContain('∞')
  })

  it('shows Mint button when canMintMore is true', () => {
    const wrapper = mount(ClassCard, {
      props: { classItem: mockClass },
    })

    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.find('button').text()).toBe('Mint')
  })

  it('shows Max Reached when canMintMore is false', () => {
    const maxedClass: CreatorClassDisplay = {
      ...mockClass,
      canMintMore: false,
    }

    const wrapper = mount(ClassCard, {
      props: { classItem: maxedClass },
    })

    expect(wrapper.text()).toContain('Max Reached')
  })

  it('emits mint event when Mint button clicked', async () => {
    const wrapper = mount(ClassCard, {
      props: { classItem: mockClass },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('mint')).toBeTruthy()
    expect(wrapper.emitted('mint')![0]).toEqual([mockClass])
  })

  it('truncates long additionalKey', () => {
    const longKeyClass: CreatorClassDisplay = {
      ...mockClass,
      additionalKey: 'verylongadditionalkey123',
    }

    const wrapper = mount(ClassCard, {
      props: { classItem: longKeyClass },
    })

    expect(wrapper.text()).toContain('...')
  })

  it('renders initials in placeholder', () => {
    const wrapper = mount(ClassCard, {
      props: { classItem: mockClass },
    })

    // Should have initials "LE" for "Legendary Sword"
    expect(wrapper.text()).toContain('LS')
  })

  it('shows progress bar with correct width', () => {
    const wrapper = mount(ClassCard, {
      props: { classItem: mockClass },
    })

    const progressBar = wrapper.find('[style]')
    expect(progressBar.attributes('style')).toContain('width: 25%')
  })
})
