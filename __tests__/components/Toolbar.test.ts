import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { Toolbar } from '@/components'
import { useConfigStore } from '@/store'
import { ToolTypeEnum } from '@/types'

vi.mock('@/components/ImportExport/index.vue', () => ({
  default: {
    name: 'ImportExport',
    template: '<div></div>'
  }
}))

const mockStorage = {
  value: ToolTypeEnum.Pencil
}
vi.mock('@vueuse/core', () => ({
  useLocalStorage: vi.fn(() => mockStorage)
}))

vi.mock('@/store', () => ({
  useConfigStore: vi.fn(),
  useCanvasStore: vi.fn()
}))

describe('Toolbar', () => {
  let wrapper: any
  let configStore: any

  beforeEach(() => {
    configStore = {
      toolType: ToolTypeEnum.Pencil,
      setToolType: vi.fn()
    }
    ;(useConfigStore as any).mockReturnValue(configStore)

    wrapper = mount(Toolbar)
  })

  it('should update toolType and localStorage when toolHandler is called with a valid tool type', () => {
    const toolTypes = Object.values(ToolTypeEnum).filter(
      type => type !== ToolTypeEnum.Broom && type !== ToolTypeEnum.Unknown
    )
    
    for (const toolType of toolTypes) {
      configStore.setToolType.mockClear()
      wrapper.vm.toolHandler(toolType)
      expect(configStore.setToolType).toHaveBeenCalledWith(toolType)
      expect(mockStorage.value).toBe(toolType)
    }
  })
}) 