import { useCanvasStore, useConfigStore } from '@/store';
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises, mount, VueWrapper } from '@vue/test-utils'
import { Toolbar } from '@/components';
import { type ComponentPublicInstance } from 'vue';
import { ToolTypeEnum } from '@/types';

type ToolbarInstance = VueWrapper<ComponentPublicInstance & {
  toolHandler?: (toolType: ToolTypeEnum) => void
  storage?: number
}>

vi.mock('@/components/ImportExport/index.vue', () => ({
  default: {
    name: "ImportExport",
    template: "<div></div>"
  }
}))

describe('Toolbar feature testing', () => {
  let wrapper: ToolbarInstance

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)

    wrapper = mount(Toolbar, {
      global: {
        plugins: [pinia]
      }
    })
  })

  it('should set active prop to true for the selected tool', async () => {
    const configStore = useConfigStore()
    const toolTypes = Object
      .values(ToolTypeEnum)
      .filter(Number) as ToolTypeEnum[]

    for (const toolType of toolTypes) {
      if (
        toolType === ToolTypeEnum.Unknown ||
        toolType === ToolTypeEnum.Broom
      ) {
        continue
      }

      wrapper.vm.toolHandler?.(toolType)
      expect(configStore.toolType).toBe(toolType)

      await wrapper.vm.$nextTick()

      const toolTypeButton = wrapper.find(`[data-testid="tooltype-${toolType}"]`)
      expect(toolTypeButton.exists()).toBe(true)

      const pixelButton = toolTypeButton.findComponent({ name: 'PixelBorderUltimate' })
      expect(pixelButton.props('active')).toBe(true)
    }
  })

  it('should clearAllPixels and record broom operation after clicking Broom tool', () => {
    const configStore = useConfigStore()
    const canvasStore = useCanvasStore()

    const clearAllPixels = vi.spyOn(canvasStore, 'clearAllPixels')
    const record = vi.spyOn(canvasStore, 'record')

    wrapper.vm.toolHandler?.(ToolTypeEnum.Pencil)
    expect(configStore.toolType).toBe(ToolTypeEnum.Pencil)

    wrapper.vm.toolHandler?.(ToolTypeEnum.Broom)
    expect(clearAllPixels).toHaveBeenCalledWith("main")
    expect(record).toHaveBeenCalledWith({ toolType: ToolTypeEnum.Broom })
    expect(configStore.toolType).toBe(ToolTypeEnum.Pencil)

    clearAllPixels.mockRestore()
    record.mockRestore()
  })

  it('should set toolType to localStorage for the selected tool', () => {
    const configStore = useConfigStore()

    wrapper.vm.toolHandler?.(ToolTypeEnum.Square)
    expect(configStore.toolType).toBe(ToolTypeEnum.Square)
    expect(wrapper.vm.storage).toBe(ToolTypeEnum.Square)
  })

  it('should persist and restore selected tool across component remounts', async () => {
    const configStore = useConfigStore()

    wrapper.vm.toolHandler?.(ToolTypeEnum.Circle)
    expect(configStore.toolType).toBe(ToolTypeEnum.Circle)
    expect(wrapper.vm.storage).toBe(ToolTypeEnum.Circle)

    await flushPromises()

    wrapper.unmount()

    // use re-mount component to mock refresh page
    const newPinia = createPinia()
    setActivePinia(newPinia)

    const newWrapper = mount(Toolbar, {
      global: {
        plugins: [newPinia]
      }
    }) as ToolbarInstance

    const newConfigStore = useConfigStore()
    expect(newConfigStore.toolType).toBe(ToolTypeEnum.Circle)
    expect(newWrapper.vm.storage).toBe(ToolTypeEnum.Circle)
  })
})