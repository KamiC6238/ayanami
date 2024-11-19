import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCanvasStore } from '../store'

export function useInitialization() {
  const canvasStore = useCanvasStore()
  const { canvas, canvasContext } = storeToRefs(canvasStore)

  watch(canvas, _canvas => {
    if (!_canvas) return
    scaleCanvasByDPR()
  })

  const scaleCanvasByDPR = () => {
    const dpr = Math.floor(window.devicePixelRatio) || 1;
  
    canvas.value!.width = canvas.value!.clientWidth * dpr;
    canvas.value!.height = canvas.value!.clientHeight * dpr;
    canvasContext.value!.scale(dpr, dpr);
  }
}