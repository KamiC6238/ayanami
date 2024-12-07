import { watch, ref } from 'vue'
import { merge, Subscription, tap } from 'rxjs'
import { storeToRefs } from 'pinia'
import { useCanvasStore, useConfigStore } from '@/store'
import { ToolTypeEnum } from '@/types'
import { getPixelPosition } from '@/utils'
import { useMouse } from './useMouse'
import { useHoverPixel } from './useHover'

export function usePencilTool() {
  const isDrawing = ref(false);
  const draw$ = ref<Subscription>()

  const configTool = useConfigStore()
  const canvasStore = useCanvasStore()
  const { mouseDown$, mouseMove$, mouseUp$, mouseLeave$, globalMouseUp$ } = useMouse()
  const { drawHoverPixel, setHoveredPixel } = useHoverPixel()

  const { canvas, displayCanvas } = storeToRefs(canvasStore)
  const { toolType } = storeToRefs(configTool)

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
          setHoveredPixel(null)
        })
      ),
      mouseMove$.value!.pipe(
        tap((event: MouseEvent) => {
          if (isDrawing.value) {
            drawPixel(event)
          } else {
            drawHoverPixel(event)
          }
        })
      ),
      mouseUp$.value!.pipe(
        tap(() => isDrawing.value = false)
      ),
      mouseLeave$.value!.pipe(
        tap(() => setHoveredPixel(null))
      ),
      globalMouseUp$.value!.pipe(
        tap(() => isDrawing.value = false)
      )
    ).subscribe()
  }

  const drawPixel = (event: MouseEvent) => {
    if (!displayCanvas.value) return

    const position = getPixelPosition(displayCanvas.value, event);

    canvasStore.fillRect(position)
  }

  return {
    isDrawing,
    initPencil,
    disposePencil,
    drawPixel,
  }
}