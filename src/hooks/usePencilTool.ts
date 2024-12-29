import { watch, ref } from 'vue'
import { merge, Subscription, tap } from 'rxjs'
import { storeToRefs } from 'pinia'
import { useCanvasStore, useConfigStore } from '@/store'
import { ToolTypeEnum } from '@/types'
import { getPixelPosition } from '@/utils'
import { useHoverPixel } from './useHover'

export function usePencilTool() {
  const isDrawing = ref(false);
  const draw$ = ref<Subscription>()

  const configTool = useConfigStore()
  const canvasStore = useCanvasStore()
  const { drawHoverPixel, setHoveredPixel } = useHoverPixel()

  const { toolType } = storeToRefs(configTool)
  const { mouseDown$, mouseLeave$, mouseMove$, mouseUp$, globalMouseUp$} = storeToRefs(canvasStore)

  watch(toolType, type => {
    if (type === ToolTypeEnum.Pencil) {
      initPencil()
    } else {
      disposePencil()
    }
  })

  const disposePencil = () => draw$.value?.unsubscribe()

  const initPencil = () => {
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
    const canvas = canvasStore.getCanvas('preview')

    if (canvas) {
      canvasStore.fillRect({
        position:  getPixelPosition(canvas, event),
        canvasType: 'main'
      })
    }
  }
}