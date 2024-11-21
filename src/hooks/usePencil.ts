import { ref, watch } from 'vue'
import { tap, merge, Subscription } from 'rxjs'
import { storeToRefs } from 'pinia'
import { useMouse } from './useMouse'
import { useCanvasStore, useToolsStore, usePixelStore } from '../store';
import { ToolTypeEnum } from '../types'

export function usePencil() {
  const isDrawing = ref(false);
  const draw$ = ref<Subscription>()

  const pixelStore = usePixelStore()
  const toolsStore = useToolsStore()
  const canvasStore = useCanvasStore()
  const { mouseDown$, mouseMove$, mouseUp$ } = useMouse()

  const { canvas } = storeToRefs(canvasStore)
  const { toolType } = storeToRefs(toolsStore)

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
          pixelStore.drawPixel(event)
        })
      ),
      mouseMove$.value!.pipe(
        tap((event: MouseEvent) => {
          if (isDrawing.value) {
            pixelStore.drawPixel(event)
          } else {
            pixelStore.drawHoverPixel(event)
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