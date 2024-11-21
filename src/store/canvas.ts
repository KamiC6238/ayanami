import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { Position } from '../types'

export const useCanvasStore = defineStore('canvas', () => {
  const canvas = ref<HTMLCanvasElement  | null>(null)

  const canvasContext = computed(() => canvas.value?.getContext('2d'))

  const setCanvas = (_canvas: HTMLCanvasElement) => {
    canvas.value = _canvas
  }

  const clearRect = (position: Position) => {
    if (canvasContext.value) {
      const { x, y } = position
      canvasContext.value.clearRect(x, y, 10, 10)
    }
  }

  const fillRect = (position: Position, type: 'draw' | 'hover' = 'draw') => {
    if (canvasContext.value) {
      const { x, y } = position
      canvasContext.value.fillStyle =type === 'draw'
        ? 'black'
        : 'rgba(0, 0, 0, 0.5)';
      canvasContext.value.fillRect(x, y, 10, 10);
    }
  }

  return {
    canvas,
    canvasContext,
    setCanvas,
    clearRect,
    fillRect,
  }
})