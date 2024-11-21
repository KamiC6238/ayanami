import { defineStore, storeToRefs } from 'pinia'
import { ToolTypeEnum, Position } from '../types'
import { useCanvasStore } from './canvas';
import { useToolsStore } from './tool';
import { ref } from 'vue';

function makePositionKey({ x, y }: Position) {
  return `${x}-${y}`;
}

export const usePixelStore = defineStore('pixel', () => {
  const drawnPixels = ref<Set<string>>(new Set());
  const hoveredPixel = ref<Position | null>(null);

  const canvasStore = useCanvasStore()
  const toolsStore = useToolsStore()

  const { toolType } = storeToRefs(toolsStore)
  const { canvas, canvasContext } = storeToRefs(canvasStore)

  const erasePixel = (event: MouseEvent) => {
    const position = getPixelPosition(event);

    if (!position) return

    canvasStore.clearRect(position)
    setDrawnPixels(position)
  }

  const drawPixel = (event: MouseEvent) => {
    const position = getPixelPosition(event)

    if (!position) return

    canvasStore.fillRect(position)
    setDrawnPixels(position)
  }

  const setDrawnPixels = (position: Position) => {
    const key = makePositionKey(position)

    switch (toolType.value) {
      case ToolTypeEnum.Pencil:
        drawnPixels.value.add(key)
        break
      case ToolTypeEnum.Eraser:
        drawnPixels.value.delete(key)
        break
    }
  }

  const setHoveredPixel = (position: Position) => {
    hoveredPixel.value = position
  }

  const drawHoverPixel = (event: MouseEvent) => {
    const position = getPixelPosition(event)

    if (!position) return

    if (hoveredPixel.value) {
      const { x, y } = hoveredPixel.value
      const previousHoveredPixelPosition = { x, y }
      const key = makePositionKey(previousHoveredPixelPosition)

      if (!drawnPixels.value.has(key)) {
        canvasStore.clearRect(previousHoveredPixelPosition)
      }

      canvasStore.fillRect(position, 'hover')
    }

    setHoveredPixel(position)
  }

  const getPixelPosition = (event: MouseEvent) => {
    if (!canvas.value || !canvasContext.value) return null
  
    const rect = canvas.value.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / 10) * 10;
    const y = Math.floor((event.clientY - rect.top) / 10) * 10;
  
    return { x, y };
  };

  return {
    erasePixel,
    drawPixel,
    setDrawnPixels,
    drawHoverPixel,
    setHoveredPixel,
    getPixelPosition,
  }
})
