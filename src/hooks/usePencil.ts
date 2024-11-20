import { ref, watch } from 'vue'
import { tap, merge, Subscription } from 'rxjs'
import { storeToRefs } from 'pinia'
import { useMouse } from './useMouse'
import { usePixels } from './usePixels'
import { useCanvasStore, usePixelToolsStore } from '../store';
import { ToolTypeEnum } from '../types'

export function usePencil() {
  const isDrawing = ref(false);
  const draw$ = ref<Subscription>()

  const pixelToosStore = usePixelToolsStore()
  const canvasStore = useCanvasStore()
  const { mouseDown$, mouseMove$, mouseUp$ } = useMouse()
  const {drawPixel, drawHoverPixel, getPixelPosition } = usePixels()

  const { canvas } = storeToRefs(canvasStore)
  const { toolType } = storeToRefs(pixelToosStore)

  watch(toolType, type => {
    if (type === ToolTypeEnum.Pencil) {
      initPencil()
    } else {
      disposePencil()
    }
  })

  const disposePencil = () => draw$.value?.unsubscribe()

  const initPencil = () => {
    if (!canvas) return

    draw$.value = merge(
      mouseDown$.value!.pipe(
        tap((event: MouseEvent) => {
          isDrawing.value = true
          drawPixel(event)
        })
      ),
      mouseMove$.value!.pipe(
        tap((event: MouseEvent) => {
          if (isDrawing.value) {
            drawPixel(event)
          } else {
            const position = getPixelPosition(event)
            position && drawHoverPixel(position.x, position.y)
          }
        })
      ),
      mouseUp$.value!.pipe(
        tap(() => isDrawing.value = false)
      ),
    ).subscribe()
  }

  return {
    isDrawing,
    initPencil,
    disposePencil
  }
}