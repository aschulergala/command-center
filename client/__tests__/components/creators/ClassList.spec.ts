/**
 * Tests for ClassList component
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ClassList from '@/components/creators/ClassList.vue'
import type { CreatorClassDisplay } from '@/stores/creatorCollections'

describe('ClassList', () => {
  const mockClasses: CreatorClassDisplay[] = [
    {
      classKey: 'Col|NFT|Type|class1',
      collection: 'Col',
      category: 'NFT',
      type: 'Type',
      additionalKey: 'class1',
      name: 'Class One',
      maxSupply: '100',
      maxSupplyFormatted: '100',
      mintedCount: '10',
      mintedCountFormatted: '10',
      canMintMore: true,
    },
    {
      classKey: 'Col|NFT|Type|class2',
      collection: 'Col',
      category: 'NFT',
      type: 'Type',
      additionalKey: 'class2',
      name: 'Class Two',
      maxSupply: '50',
      maxSupplyFormatted: '50',
      mintedCount: '50',
      mintedCountFormatted: '50',
      canMintMore: false,
    },
  ]

  it('renders loading state', () => {
    const wrapper = mount(ClassList, {
      props: {
        classes: [],
        isLoading: true,
      },
    })

    expect(wrapper.find('.animate-pulse').exists()).toBe(true)
  })

  it('renders empty state when no classes', () => {
    const wrapper = mount(ClassList, {
      props: {
        classes: [],
        isLoading: false,
      },
    })

    expect(wrapper.text()).toContain('No classes defined yet')
    expect(wrapper.text()).toContain('Create your first class')
  })

  it('renders class cards when classes exist', () => {
    const wrapper = mount(ClassList, {
      props: {
        classes: mockClasses,
        isLoading: false,
      },
    })

    expect(wrapper.text()).toContain('Class One')
    expect(wrapper.text()).toContain('Class Two')
  })

  it('emits createClass when empty state button clicked', async () => {
    const wrapper = mount(ClassList, {
      props: {
        classes: [],
        isLoading: false,
      },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('createClass')).toBeTruthy()
  })

  it('emits mint event from class cards', async () => {
    const wrapper = mount(ClassList, {
      props: {
        classes: mockClasses,
        isLoading: false,
      },
    })

    // Find the first Mint button (for Class One which canMintMore)
    const mintButtons = wrapper.findAll('button').filter(b => b.text() === 'Mint')
    await mintButtons[0].trigger('click')

    expect(wrapper.emitted('mint')).toBeTruthy()
    expect(wrapper.emitted('mint')![0]).toEqual([mockClasses[0]])
  })
})
