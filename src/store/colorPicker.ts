import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { RGB } from '@/types'
import { makeRGB, rgbToHsl } from '@/utils'

export const useColorPickerStore = defineStore('colorPicker', () => {
  const rgb = ref<RGB>({ r: 0, g: 0, b: 0 })
  const pickedRGB = ref<RGB>({ r: 0, g: 0, b: 0 })

  const hsl = computed(() => rgbToHsl(rgb.value))

  const previewColor = computed(() => makeRGB(rgb.value))

  const setRGB = (val: RGB) => {
    rgb.value = val
  }

  const updatePickedColor = () => {
    pickedRGB.value = { ...rgb.value }
  }

  return {
    hsl,
    rgb,
    pickedRGB,
    previewColor,
    setRGB,
    updatePickedColor,
  }
})