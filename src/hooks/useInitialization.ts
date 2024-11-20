import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCanvasStore, usePixelToolsStore } from '../store'
import { ToolTypeEnum } from '../types'

export function useInitialization() {
  const pixeltoolsStore = usePixelToolsStore()
  const canvasStore = useCanvasStore()
  const { canvas, canvasContext } = storeToRefs(canvasStore)

  watch(canvas, _canvas => {
    if (!_canvas) return
    scaleCanvasByDPR()
    pixeltoolsStore.setToolType(ToolTypeEnum.Pencil)
  })

  const scaleCanvasByDPR = () => {
    const dpr = Math.floor(window.devicePixelRatio) || 1;
  
    canvas.value!.width = canvas.value!.clientWidth * dpr;
    canvas.value!.height = canvas.value!.clientHeight * dpr;
    canvasContext.value!.scale(dpr, dpr);
  }
}