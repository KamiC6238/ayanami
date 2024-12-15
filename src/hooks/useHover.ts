import { ref } from 'vue';
import type { Position } from '@/types'
import { isPixelPositionChanged, getPixelPosition } from '@/utils'
import { DEFAULT_PIXEL_SIZE } from '@/constants';
import { useCanvasStore } from '@/store';

export function useHoverPixel() {
  const hoveredPixel = ref<Position | null>(null);

  const canvasStore = useCanvasStore()

  const drawHoverPixel = (event: MouseEvent) => {
    const canvas = canvasStore.getCanvas('preview')

    if (!canvas) return

    const position = getPixelPosition(
      canvas,
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
