import { defineStore } from 'pinia'
import { ToolTypeEnum } from '../types'

interface PixelToolStoreState {
  toolType: ToolTypeEnum
}

export const usePixelToolsStore = defineStore('pixelTools', {
  state: (): PixelToolStoreState => ({
    toolType: ToolTypeEnum.Unknown
  }),
  actions: {
    setToolType(toolType: ToolTypeEnum) {
      this.toolType = toolType
    }
  }
})