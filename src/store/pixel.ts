import { ref } from 'vue';
import { defineStore, storeToRefs } from 'pinia'
import type { Position } from '@/types'
import { isPixelPositionChanged, getPixelPosition } from '@/utils'
import { DEFAULT_PIXEL_COLOR, DEFAULT_PIXEL_SIZE } from '@/constants';
import { useCanvasStore } from './canvas';

export const usePixelStore = defineStore('pixel', () => {
  const hoveredPixel = ref<Position | null>(null);
  const pixelSize = ref(DEFAULT_PIXEL_SIZE)
  const pixelColor = ref(DEFAULT_PIXEL_COLOR)

  const canvasStore = useCanvasStore()
  const { displayCanvas } = storeToRefs(canvasStore)

  const erasePixel = (event: MouseEvent) => {
    if (!displayCanvas.value) return

    const position = getPixelPosition(displayCanvas.value, event)

    canvasStore.clearRect(position, {
      pixelSize: pixelSize.value
    })
  }

  const drawPixel = (event: MouseEvent) => {
    if (!displayCanvas.value) return

    const position = getPixelPosition(displayCanvas.value, event);

    canvasStore.fillRect(position, {
      pixelSize: pixelSize.value,
      color: pixelColor.value
    })
  }

  const drawHoverPixel = (event: MouseEvent) => {
    if (!displayCanvas.value) return

    const position = getPixelPosition(
      displayCanvas.value,
      event,
      DEFAULT_PIXEL_SIZE
    )

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

    setHoveredPixel(null)
  }

  const setHoveredPixel = (position: Position | null) => {
    if (position) {
      if (
        hoveredPixel.value &&
        !isPixelPositionChanged(position, hoveredPixel.value)
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
      canvasStore.clearHoverRect(hoveredPixel.value, {
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
    pixelSize,
    erasePixel,
    drawPixel,
    drawHoverPixel,
    setHoveredPixel,
    setPixelSize,
    setPixelColor,
  }
})
