import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CollectionList from '@/components/creators/CollectionList.vue'
import CollectionCard from '@/components/creators/CollectionCard.vue'
import CollectionCardSkeleton from '@/components/creators/CollectionCardSkeleton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import type { CreatorCollectionDisplay } from '@/stores/creatorCollections'

describe('CollectionList', () => {
  const mockCollections: CreatorCollectionDisplay[] = [
    {
      collectionKey: 'Collection1|Cat|Type|',
      collection: 'Collection1',
      category: 'Cat',
      type: 'Type',
      additionalKey: '',
      name: 'First Collection',
      symbol: 'FC',
      description: '',
      image: '',
      isNonFungible: true,
      maxSupply: '0',
      totalSupply: '0',
      totalBurned: '0',
      isAuthority: true,
      ownedCount: 10,
      mintAllowanceRaw: '1000',
      mintAllowanceFormatted: '1K',
      hasUnlimitedMint: false,
      classes: [],
      isExpanded: false,
    },
    {
      collectionKey: 'Collection2|Cat|Type|',
      collection: 'Collection2',
      category: 'Cat',
      type: 'Type',
      additionalKey: '',
      name: 'Second Collection',
      symbol: 'SC',
      description: '',
      image: '',
      isNonFungible: true,
      maxSupply: '0',
      totalSupply: '0',
      totalBurned: '0',
      isAuthority: true,
      ownedCount: 5,
      mintAllowanceRaw: '500',
      mintAllowanceFormatted: '500',
      hasUnlimitedMint: false,
      classes: [],
      isExpanded: false,
    },
  ]

  it('should render collection cards when collections exist', () => {
    const wrapper = mount(CollectionList, {
      props: {
        collections: mockCollections,
        isLoading: false,
      },
      global: {
        components: { CollectionCard, CollectionCardSkeleton, EmptyState },
      },
    })

    expect(wrapper.text()).toContain('First Collection')
    expect(wrapper.text()).toContain('Second Collection')
  })

  it('should render correct number of collection cards', () => {
    const wrapper = mount(CollectionList, {
      props: {
        collections: mockCollections,
        isLoading: false,
      },
      global: {
        components: { CollectionCard, CollectionCardSkeleton, EmptyState },
      },
    })

    const cards = wrapper.findAllComponents(CollectionCard)
    expect(cards.length).toBe(2)
  })

  it('should render loading skeletons when loading with no collections', () => {
    const wrapper = mount(CollectionList, {
      props: {
        collections: [],
        isLoading: true,
      },
      global: {
        components: { CollectionCard, CollectionCardSkeleton, EmptyState },
      },
    })

    const skeletons = wrapper.findAllComponents(CollectionCardSkeleton)
    expect(skeletons.length).toBe(3) // Default 3 skeletons
  })

  it('should render empty state when not loading and no collections', () => {
    const wrapper = mount(CollectionList, {
      props: {
        collections: [],
        isLoading: false,
      },
      global: {
        components: { CollectionCard, CollectionCardSkeleton, EmptyState },
      },
    })

    expect(wrapper.text()).toContain('No Collections Found')
    expect(wrapper.text()).toContain('Create a new collection')
  })

  it('should emit mint event from collection card', async () => {
    const wrapper = mount(CollectionList, {
      props: {
        collections: mockCollections,
        isLoading: false,
      },
      global: {
        components: { CollectionCard, CollectionCardSkeleton, EmptyState },
      },
    })

    // Find the first collection card and emit mint
    const firstCard = wrapper.findComponent(CollectionCard)
    await firstCard.vm.$emit('mint', mockCollections[0])

    expect(wrapper.emitted('mint')).toBeTruthy()
    expect(wrapper.emitted('mint')![0]).toEqual([mockCollections[0]])
  })

  it('should emit manageClasses event from collection card', async () => {
    const wrapper = mount(CollectionList, {
      props: {
        collections: mockCollections,
        isLoading: false,
      },
      global: {
        components: { CollectionCard, CollectionCardSkeleton, EmptyState },
      },
    })

    const firstCard = wrapper.findComponent(CollectionCard)
    await firstCard.vm.$emit('manageClasses', mockCollections[0])

    expect(wrapper.emitted('manageClasses')).toBeTruthy()
    expect(wrapper.emitted('manageClasses')![0]).toEqual([mockCollections[0]])
  })

  it('should emit toggleExpand event from collection card', async () => {
    const wrapper = mount(CollectionList, {
      props: {
        collections: mockCollections,
        isLoading: false,
      },
      global: {
        components: { CollectionCard, CollectionCardSkeleton, EmptyState },
      },
    })

    const firstCard = wrapper.findComponent(CollectionCard)
    await firstCard.vm.$emit('toggleExpand', 'Collection1|Cat|Type|')

    expect(wrapper.emitted('toggleExpand')).toBeTruthy()
    expect(wrapper.emitted('toggleExpand')![0]).toEqual(['Collection1|Cat|Type|'])
  })

  it('should show collections even when loading if collections exist', () => {
    const wrapper = mount(CollectionList, {
      props: {
        collections: mockCollections,
        isLoading: true,
      },
      global: {
        components: { CollectionCard, CollectionCardSkeleton, EmptyState },
      },
    })

    // Should show collections, not skeletons
    const cards = wrapper.findAllComponents(CollectionCard)
    expect(cards.length).toBe(2)

    const skeletons = wrapper.findAllComponents(CollectionCardSkeleton)
    expect(skeletons.length).toBe(0)
  })
})
