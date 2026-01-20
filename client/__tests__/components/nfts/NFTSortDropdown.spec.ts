import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NFTSortDropdown from '@/components/nfts/NFTSortDropdown.vue'
import type { NFTSortOption } from '@/stores/nfts'

describe('NFTSortDropdown', () => {
  beforeEach(() => {
    vi.spyOn(document, 'addEventListener')
    vi.spyOn(document, 'removeEventListener')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render dropdown button with current sort label', () => {
    const wrapper = mount(NFTSortDropdown, {
      props: { modelValue: 'collection-asc' as NFTSortOption },
    })

    const button = wrapper.find('button')
    expect(button.text()).toContain('Collection A-Z')
  })

  it('should show correct label for each sort option', () => {
    const options: { value: NFTSortOption; label: string }[] = [
      { value: 'collection-asc', label: 'Collection A-Z' },
      { value: 'collection-desc', label: 'Collection Z-A' },
      { value: 'instance-asc', label: 'ID (Low to High)' },
      { value: 'instance-desc', label: 'ID (High to Low)' },
      { value: 'name-asc', label: 'Name A-Z' },
      { value: 'name-desc', label: 'Name Z-A' },
    ]

    for (const option of options) {
      const wrapper = mount(NFTSortDropdown, {
        props: { modelValue: option.value },
      })
      expect(wrapper.find('button').text()).toContain(option.label)
    }
  })

  it('should toggle dropdown when button is clicked', async () => {
    const wrapper = mount(NFTSortDropdown, {
      props: { modelValue: 'collection-asc' as NFTSortOption },
    })

    // Initially closed
    expect(wrapper.find('.py-1').exists()).toBe(false)

    // Click to open
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('.py-1').exists()).toBe(true)

    // Click to close
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('.py-1').exists()).toBe(false)
  })

  it('should show all sort options in dropdown', async () => {
    const wrapper = mount(NFTSortDropdown, {
      props: { modelValue: 'collection-asc' as NFTSortOption },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.text()).toContain('Collection A-Z')
    expect(wrapper.text()).toContain('Collection Z-A')
    expect(wrapper.text()).toContain('ID (Low to High)')
    expect(wrapper.text()).toContain('ID (High to Low)')
    expect(wrapper.text()).toContain('Name A-Z')
    expect(wrapper.text()).toContain('Name Z-A')
  })

  it('should emit update:modelValue when sort option is selected', async () => {
    const wrapper = mount(NFTSortDropdown, {
      props: { modelValue: 'collection-asc' as NFTSortOption },
    })

    await wrapper.find('button').trigger('click')

    const instanceDescButton = wrapper.findAll('.py-1 button').find(b => b.text().includes('ID (High to Low)'))
    await instanceDescButton!.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['instance-desc'])
  })

  it('should close dropdown after selection', async () => {
    const wrapper = mount(NFTSortDropdown, {
      props: { modelValue: 'collection-asc' as NFTSortOption },
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.find('.py-1').exists()).toBe(true)

    const nameButton = wrapper.findAll('.py-1 button').find(b => b.text().includes('Name A-Z'))
    await nameButton!.trigger('click')

    expect(wrapper.find('.py-1').exists()).toBe(false)
  })

  it('should highlight currently selected option', async () => {
    const wrapper = mount(NFTSortDropdown, {
      props: { modelValue: 'name-desc' as NFTSortOption },
    })

    await wrapper.find('button').trigger('click')

    const selectedButton = wrapper.findAll('.py-1 button').find(b => b.text().includes('Name Z-A'))
    expect(selectedButton?.classes()).toContain('text-gala-primary')
    expect(selectedButton?.classes()).toContain('font-medium')
  })

  it('should show checkmark for selected option', async () => {
    const wrapper = mount(NFTSortDropdown, {
      props: { modelValue: 'instance-asc' as NFTSortOption },
    })

    await wrapper.find('button').trigger('click')

    const selectedButton = wrapper.findAll('.py-1 button').find(b => b.text().includes('ID (Low to High)'))
    // Should have an svg checkmark inside
    expect(selectedButton?.find('svg').exists()).toBe(true)
  })

  it('should not show checkmark for unselected options', async () => {
    const wrapper = mount(NFTSortDropdown, {
      props: { modelValue: 'instance-asc' as NFTSortOption },
    })

    await wrapper.find('button').trigger('click')

    const unselectedButton = wrapper.findAll('.py-1 button').find(b => b.text().includes('Name Z-A'))
    // Should not have an svg checkmark
    expect(unselectedButton?.find('svg').exists()).toBe(false)
  })

  it('should add click outside listener on mount', () => {
    mount(NFTSortDropdown, {
      props: { modelValue: 'collection-asc' as NFTSortOption },
    })

    expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function))
  })

  it('should remove click outside listener on unmount', () => {
    const wrapper = mount(NFTSortDropdown, {
      props: { modelValue: 'collection-asc' as NFTSortOption },
    })

    wrapper.unmount()

    expect(document.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function))
  })
})
