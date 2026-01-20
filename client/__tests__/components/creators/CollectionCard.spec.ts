import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CollectionCard from '@/components/creators/CollectionCard.vue'
import type { CreatorCollectionDisplay } from '@/stores/creatorCollections'

describe('CollectionCard', () => {
  const mockCollection: CreatorCollectionDisplay = {
    collectionKey: 'MyCollection|Item|Weapons|',
    collection: 'MyCollection',
    category: 'Item',
    type: 'Weapons',
    additionalKey: '',
    name: 'My Awesome Collection',
    symbol: 'MAC',
    description: 'A test collection',
    image: '',
    isNonFungible: true,
    maxSupply: '0',
    totalSupply: '0',
    totalBurned: '0',
    isAuthority: true,
    ownedCount: 5,
    mintAllowanceRaw: '950',
    mintAllowanceFormatted: '950',
    hasUnlimitedMint: false,
    classes: [],
    isExpanded: false,
  }

  const mockCollectionWithImage: CreatorCollectionDisplay = {
    ...mockCollection,
    image: 'https://example.com/image.png',
  }

  const mockCollectionUnlimited: CreatorCollectionDisplay = {
    ...mockCollection,
    hasUnlimitedMint: true,
    mintAllowanceFormatted: 'Unlimited',
  }

  it('should render collection name', () => {
    const wrapper = mount(CollectionCard, {
      props: { collection: mockCollection },
    })

    expect(wrapper.text()).toContain('My Awesome Collection')
  })

  it('should render collection key (truncated)', () => {
    const wrapper = mount(CollectionCard, {
      props: { collection: mockCollection },
    })

    expect(wrapper.text()).toContain('MyCollection|Item|Weapons|')
  })

  it('should display Authority badge', () => {
    const wrapper = mount(CollectionCard, {
      props: { collection: mockCollection },
    })

    expect(wrapper.text()).toContain('Authority')
  })

  it('should display owned count', () => {
    const wrapper = mount(CollectionCard, {
      props: { collection: mockCollection },
    })

    expect(wrapper.text()).toContain('5')
    expect(wrapper.text()).toContain('owned')
  })

  it('should display mint allowance', () => {
    const wrapper = mount(CollectionCard, {
      props: { collection: mockCollection },
    })

    expect(wrapper.text()).toContain('950')
    expect(wrapper.text()).toContain('mint remaining')
  })

  it('should display "Unlimited" for unlimited mint', () => {
    const wrapper = mount(CollectionCard, {
      props: { collection: mockCollectionUnlimited },
    })

    expect(wrapper.text()).toContain('Unlimited')
    expect(wrapper.text()).not.toContain('mint remaining')
  })

  it('should render placeholder with initials when no image', () => {
    const wrapper = mount(CollectionCard, {
      props: { collection: mockCollection },
    })

    // Should show initials "MA" for "My Awesome Collection"
    expect(wrapper.text()).toContain('MA')
  })

  it('should render image when provided', () => {
    const wrapper = mount(CollectionCard, {
      props: { collection: mockCollectionWithImage },
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/image.png')
  })

  it('should have Mint button', () => {
    const wrapper = mount(CollectionCard, {
      props: { collection: mockCollection },
    })

    const mintButton = wrapper.find('button:not([disabled])')
    expect(mintButton.exists()).toBe(true)
    expect(mintButton.text()).toContain('Mint')
  })

  it('should emit mint event when Mint button clicked', async () => {
    const wrapper = mount(CollectionCard, {
      props: { collection: mockCollection },
    })

    const mintButton = wrapper.findAll('button').find(btn => btn.text().includes('Mint') && !btn.attributes('disabled'))
    await mintButton?.trigger('click')

    expect(wrapper.emitted('mint')).toBeTruthy()
    expect(wrapper.emitted('mint')![0]).toEqual([mockCollection])
  })

  it('should have enabled Manage Classes button', () => {
    const wrapper = mount(CollectionCard, {
      props: { collection: mockCollection },
    })

    const manageButton = wrapper.findAll('button').find(btn => btn.text().includes('Manage Classes'))
    expect(manageButton).toBeDefined()
    // Button is now enabled (not disabled)
    expect(manageButton?.attributes('disabled')).toBeUndefined()
  })

  it('should emit manageClasses event when Manage Classes button clicked', async () => {
    const wrapper = mount(CollectionCard, {
      props: { collection: mockCollection },
    })

    const manageButton = wrapper.findAll('button').find(btn => btn.text().includes('Manage Classes'))
    await manageButton?.trigger('click')

    expect(wrapper.emitted('manageClasses')).toBeTruthy()
    expect(wrapper.emitted('manageClasses')![0]).toEqual([mockCollection])
  })

  it('should have expand/collapse button', () => {
    const wrapper = mount(CollectionCard, {
      props: { collection: mockCollection },
    })

    // Find the last button (expand/collapse)
    const buttons = wrapper.findAll('button')
    const expandButton = buttons[buttons.length - 1]
    expect(expandButton.exists()).toBe(true)
  })

  it('should not show expanded content when not expanded', () => {
    const wrapper = mount(CollectionCard, {
      props: { collection: mockCollection },
    })

    // The expanded section with class list or empty message should not be shown
    expect(wrapper.text()).not.toContain('No classes defined yet')
    // Note: "Classes" text appears in "Manage Classes" button, so we check for the expanded section border
    expect(wrapper.find('.border-t').exists()).toBe(false)
  })

  it('should show empty classes message when expanded with no classes', () => {
    const expandedCollection = { ...mockCollection, isExpanded: true }
    const wrapper = mount(CollectionCard, {
      props: { collection: expandedCollection },
    })

    expect(wrapper.text()).toContain('No classes defined yet')
  })

  it('should show classes when expanded with classes', () => {
    const collectionWithClasses: CreatorCollectionDisplay = {
      ...mockCollection,
      isExpanded: true,
      classes: [
        {
          classKey: 'class1',
          collection: 'MyCollection',
          category: 'Item',
          type: 'Weapons',
          additionalKey: '',
          name: 'Swords',
          maxSupply: '100',
          maxSupplyFormatted: '100',
          mintedCount: '25',
          mintedCountFormatted: '25',
          canMintMore: true,
        },
      ],
    }

    const wrapper = mount(CollectionCard, {
      props: { collection: collectionWithClasses },
    })

    expect(wrapper.text()).toContain('Classes')
    expect(wrapper.text()).toContain('Swords')
    expect(wrapper.text()).toContain('25')
    expect(wrapper.text()).toContain('100')
  })

  it('should truncate long collection keys', () => {
    const longKeyCollection: CreatorCollectionDisplay = {
      ...mockCollection,
      collectionKey: 'VeryLongCollectionNameThatExceedsTheLimit|Category|Type|AdditionalKey',
    }

    const wrapper = mount(CollectionCard, {
      props: { collection: longKeyCollection },
    })

    // Should be truncated
    expect(wrapper.text()).toContain('...')
  })
})
