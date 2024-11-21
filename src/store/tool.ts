import { defineStore } from 'pinia'
import { ToolTypeEnum } from '../types'
import { ref } from 'vue'

export const useToolsStore = defineStore('tools', () => {
  const toolType = ref<ToolTypeEnum>(ToolTypeEnum.Unknown)

  const setToolType = (_toolType: ToolTypeEnum) => {
    toolType.value = _toolType
  }

  return {
    toolType,
    setToolType
  }
})