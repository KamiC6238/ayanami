import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { RGB } from '@/types'
import { makeRGB, rgbToHsl } from '@/utils'

export const useColorPickerStore = defineStore('colorPicker', () => {
  const palette = ref<HTMLCanvasElement | null>(null)
  const rgb = ref<RGB>({ r: 255, g: 0, b: 0 })

  const hsl = computed(() => rgbToHsl(rgb.value))

  const previewColor = computed(() => makeRGB(rgb.value))

  const setPalette = (canvas: HTMLCanvasElement) => {
    palette.value = canvas
  }

  const setRGB = (val: RGB) => {
    rgb.value = val
  }

  return {
    palette,
    hsl,
    rgb,
    previewColor,
    setRGB,
    setPalette,
  }
})