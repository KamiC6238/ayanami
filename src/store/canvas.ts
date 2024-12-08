import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Position } from '@/types'
import { DEFAULT_HOVERED_PIXEL_COLOR } from '@/constants';
import { useConfigStore } from './config';

function scaleCanvasByDPR(canvas: HTMLCanvasElement) {
  const dpr = Math.floor(window.devicePixelRatio) || 1;
  
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  canvas.getContext('2d')?.scale(dpr, dpr)
}

export const useCanvasStore = defineStore('canvas', () => {
  const canvas = ref<HTMLCanvasElement  | null>(null)
  const displayCanvas = ref<HTMLCanvasElement  | null>(null)

  const configStore = useConfigStore()

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

  const fillRect = ({ x, y }: Position, context?: CanvasRenderingContext2D) => {
    const _canvasContext = context ?? canvasContext.value

    if (!_canvasContext) return

    _canvasContext.fillStyle = configStore.pixelColor
    _canvasContext.fillRect(
      x,
      y,
      configStore.pixelSize,
      configStore.pixelSize
    )
  }

  const clearRect = ({ x, y }: Position, context?: CanvasRenderingContext2D) => {
    const _canvasContext = context ?? canvasContext.value

    if (!_canvasContext) return

    _canvasContext.fillStyle = configStore.pixelColor
    _canvasContext.clearRect(
      x,
      y,
      configStore.pixelSize,
      configStore.pixelSize
    )
  }

  const fillHoverRect = ({ x, y }: Position) => {
    if (displayCanvasContext.value) {
      displayCanvasContext.value.fillStyle = DEFAULT_HOVERED_PIXEL_COLOR
      displayCanvasContext.value.fillRect(
        x,
        y,
        configStore.pixelSize,
        configStore.pixelSize
      )
    }
  }

  const clearHoverRect = ({ x, y }: Position) => {
    if (displayCanvasContext.value) {
      displayCanvasContext.value.clearRect(
        x,
        y,
        configStore.pixelSize,
        configStore.pixelSize
      )
    }
  }

  const clearAllPixels = (context?: CanvasRenderingContext2D) => {
    const _canvasContext = context ?? canvasContext.value

    if (!_canvasContext) return

    _canvasContext.clearRect(
      0,
      0,
      _canvasContext.canvas.width,
      _canvasContext.canvas.height
    )
  }

  return {
    canvas,
    canvasContext,
    displayCanvas,
    displayCanvasContext,
    setCanvas,
    setDisplayCanvas,
    fillRect,
    clearRect,
    fillHoverRect,
    clearHoverRect,
    clearAllPixels,
  }
})