import { ref } from 'vue';
import { defineStore, storeToRefs } from 'pinia'
import type { Position } from '@/types'
import { isPixelPositionChanged, makePixelPositionKey, getPixelPosition } from '@/utils'
import { DEFAULT_PIXEL_COLOR, DEFAULT_PIXEL_SIZE } from '@/constants';
import { useCanvasStore } from './canvas';

export const usePixelStore = defineStore('pixel', () => {
  const drawnPixels = ref<Set<string>>(new Set());
  const hoveredPixel = ref<Position | null>(null);
  const pixelSize = ref(DEFAULT_PIXEL_SIZE)
  const pixelColor = ref(DEFAULT_PIXEL_COLOR)

  const canvasStore = useCanvasStore()
  const { canvas } = storeToRefs(canvasStore)

  const erasePixel = (event: MouseEvent) => {
    if (!canvas.value) return

    const position = getPixelPosition(canvas.value, event)
    const key = makePixelPositionKey(position)

    if (!drawnPixels.value.has(key)) return

    drawnPixels.value.delete(key)
    canvasStore.clearRect(position, {
      pixelSize: pixelSize.value
    })
  }

  const drawPixel = (event: MouseEvent) => {
    if (!canvas.value) return

    const position = getPixelPosition(canvas.value, event);
    const key = makePixelPositionKey(position)

    if (drawnPixels.value.has(key)) return

    drawnPixels.value.add(key)

    canvasStore.fillRect(position, {
      pixelSize: pixelSize.value,
      color: pixelColor.value
    })
  }

  const drawHoverPixel = (event: MouseEvent) => {
    if (!canvas.value) return

    const position = getPixelPosition(canvas.value, event);

    clearPreHoveredPixel(position)
    setHoveredPixel(position)
  }

  const clearPreHoveredPixel = (position: Position) => {
    if (
      !hoveredPixel.value ||
      !isPixelPositionChanged(position, hoveredPixel.value)
    ) {
      return
    }

    const key = makePixelPositionKey(hoveredPixel.value)

    if (!drawnPixels.value.has(key)) {
      setHoveredPixel(null)
    }
  }

  const setHoveredPixel = (position: Position | null) => {
    if (position) {
      if (
        hoveredPixel.value &&
        !isPixelPositionChanged(hoveredPixel.value, position)
      ) {
        return
      }

      hoveredPixel.value = position
      canvasStore.fillHoverRect(position, {
        pixelSize: pixelSize.value,
      })
      return
    }

    if (!position && hoveredPixel.value) {
      canvasStore.clearRect(hoveredPixel.value, {
        pixelSize: pixelSize.value
      })
      hoveredPixel.value = null
    }
  }

  const setPixelSize = (size: number) => {
    pixelSize.value = size
  }

  const setPixelColor = (color: string) => {
    pixelColor.value = color
  }

  return {
    erasePixel,
    drawPixel,
    drawHoverPixel,
    setHoveredPixel,
    setPixelSize,
    setPixelColor,
  }
})
