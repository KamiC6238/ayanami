import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { ClearRectConfig, FillHoverRectConfig, FillRectConfig, Position } from '@/types'
import { DEFAULT_PIXEL_SIZE, DEFAULT_PIXEL_COLOR, DEFAULT_HOVERED_PIXEL_COLOR } from '@/constants';

function scaleCanvasByDPR(canvas: HTMLCanvasElement) {
  const dpr = Math.floor(window.devicePixelRatio) || 1;
  
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  canvas.getContext('2d')?.scale(dpr, dpr)
}

export const useCanvasStore = defineStore('canvas', () => {
  const canvas = ref<HTMLCanvasElement  | null>(null)
  const displayCanvas = ref<HTMLCanvasElement  | null>(null)

  const canvasContext = computed(() => canvas.value?.getContext('2d'))
  const displayCanvasContext = computed(() => displayCanvas.value?.getContext('2d'))

  const setCanvas = (_canvas: HTMLCanvasElement) => {
    canvas.value = _canvas
    scaleCanvasByDPR(_canvas)
  }

  const setDisplayCanvas = (_canvas: HTMLCanvasElement) => {
    displayCanvas.value = _canvas
    scaleCanvasByDPR(_canvas)
  }

  const fillRect = (
    { x, y }: Position,
    config: FillRectConfig = {
      pixelSize: DEFAULT_PIXEL_SIZE,
      color: DEFAULT_PIXEL_COLOR
    }
  ) => {
    if (canvasContext.value) {
      const { pixelSize, color } = config

      canvasContext.value.fillStyle = color
      canvasContext.value.fillRect(x, y, pixelSize, pixelSize);
    }
  }

  const clearRect = (
    { x, y }: Position,
    config: ClearRectConfig = {
      pixelSize: DEFAULT_PIXEL_SIZE
    }
  ) => {
    if (canvasContext.value) {
      const { pixelSize } = config
      canvasContext.value.clearRect(x, y, pixelSize, pixelSize)
    }
  }

  const fillHoverRect = (
    { x, y }: Position,
    config: FillHoverRectConfig = {
      pixelSize: DEFAULT_PIXEL_SIZE
    }
  ) => {
    if (displayCanvasContext.value) {
      const { pixelSize } = config

      displayCanvasContext.value.fillStyle = DEFAULT_HOVERED_PIXEL_COLOR
      displayCanvasContext.value.fillRect(x, y, pixelSize, pixelSize);
    }
  }

  const clearHoverRect = (
    { x, y }: Position,
    config: ClearRectConfig = {
      pixelSize: DEFAULT_PIXEL_SIZE
    }
  ) => {
    if (displayCanvasContext.value) {
      const { pixelSize } = config
      displayCanvasContext.value.clearRect(x, y, pixelSize, pixelSize)
    }
  }

  return {
    canvas,
    canvasContext,
    displayCanvas,
    setCanvas,
    setDisplayCanvas,
    fillRect,
    clearRect,
    fillHoverRect,
    clearHoverRect,
  }
})