import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Position } from '@/types'

function scaleCanvasByDPR(canvas: HTMLCanvasElement) {
  const dpr = Math.floor(window.devicePixelRatio) || 1;
  
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  canvas.getContext('2d')?.scale(dpr, dpr)
}

export const useCanvasStore = defineStore('canvas', () => {
  const canvas = ref<HTMLCanvasElement  | null>(null)

  const canvasContext = computed(() => canvas.value?.getContext('2d'))

  const setCanvas = (_canvas: HTMLCanvasElement) => {
    canvas.value = _canvas
    scaleCanvasByDPR(_canvas)
  }

  const clearRect = ({ x, y }: Position) => {
    if (canvasContext.value) {
      canvasContext.value.clearRect(x, y, 10, 10)
    }
  }

  const fillRect = ({ x, y }: Position, type: 'draw' | 'hover' = 'draw') => {
    if (canvasContext.value) {
      const style = type === 'draw' ? 'black' : 'rgba(0, 0, 0, 0.5)';

      canvasContext.value.fillStyle = style
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