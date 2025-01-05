import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { RGBA, HSL } from '@/types'
import { makeRGBA, rgbToHsl } from '@/utils'

const INIT_RGB = { r: 255, g: 0, b: 0 }

export const useColorPickerStore = defineStore('colorPicker', () => {
  const palette = ref<HTMLCanvasElement | null>(null)
  const rgb = ref<RGBA>(INIT_RGB)
  const hsl = ref<HSL>(rgbToHsl(INIT_RGB))
  const alpha = ref(1)

  const previewColor = computed(() => {
    return `${makeRGBA({ ...rgb.value, a: alpha.value })}`
  })

  const setPalette = (canvas: HTMLCanvasElement) => {
    palette.value = canvas
  }

  const setRGB = (val: RGBA) => {
    rgb.value = val
  }

  const setHSL = (val: HSL) => {
    hsl.value = val
  }

  const setAlpha = (val: number) => {
    alpha.value = val
  }

  return {
    previewColor,
    palette,
    setPalette,
    alpha,
    setAlpha,
    rgb,
    setRGB,
    hsl,
    setHSL,
  }
})