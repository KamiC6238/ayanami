import { ref } from 'vue';
import { storeToRefs } from 'pinia'
import type { Position } from '@/types'
import { isPixelPositionChanged, getPixelPosition } from '@/utils'
import { DEFAULT_PIXEL_SIZE } from '@/constants';
import { useCanvasStore } from '@/store';

export function useHoverPixel() {
  const hoveredPixel = ref<Position | null>(null);

  const canvasStore = useCanvasStore()
  const { displayCanvas } = storeToRefs(canvasStore)

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
      canvasStore.fillHoverRect(position)
      return
    }

    if (!position && hoveredPixel.value) {
      canvasStore.clearHoverRect(hoveredPixel.value)
      hoveredPixel.value = null
    }
  }

  return {
    drawHoverPixel,
    setHoveredPixel,
  }
}
