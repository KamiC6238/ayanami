import { watch, ref } from 'vue'
import { merge, Subscription, tap } from 'rxjs'
import { storeToRefs } from 'pinia'
import { useCanvasStore, useConfigStore } from '@/store'
import { ToolTypeEnum } from '@/types'
import { getPixelPosition } from '@/utils'
import { useMouse } from './useMouse'
import { useHoverPixel } from './useHover'

export function useEraser() {
  const isErasing = ref(false);
  const erase$ = ref<Subscription>()

  const toolsStore = useConfigStore()
  const canvasStore = useCanvasStore()
  const { mouseDown$, mouseMove$, mouseUp$, mouseLeave$, globalMouseUp$ } = useMouse()
  const { drawHoverPixel, setHoveredPixel } = useHoverPixel()

  const { canvas, displayCanvas } = storeToRefs(canvasStore)
  const { toolType, pixelSize } = storeToRefs(toolsStore)

  watch(toolType, type => {
    if (type === ToolTypeEnum.Eraser) {
      initEraser()
    } else {
      disposeEraser()
    }
  })

  const disposeEraser = () => erase$.value?.unsubscribe()

  const initEraser = () =>  {
    if (!canvas) return

    erase$.value = merge(
      mouseDown$.value!.pipe(
        tap((event: MouseEvent) => {
          isErasing.value = true
          erasePixel(event)
        })
      ),
      mouseMove$.value!.pipe(
        tap((event: MouseEvent) => {
          if (isErasing.value) {
            erasePixel(event)
          }
          drawHoverPixel(event)
        })
      ),
      mouseUp$.value!.pipe(
        tap(() => isErasing.value = false)
      ),
      mouseLeave$.value!.pipe(
        tap(() => setHoveredPixel(null))
      ),
      globalMouseUp$.value!.pipe(
        tap(() => isErasing.value = false)
      )
    ).subscribe()
  }

  const erasePixel = (event: MouseEvent) => {
    if (!displayCanvas.value) return

    const position = getPixelPosition(displayCanvas.value, event)

    canvasStore.clearRect(position, {
      pixelSize: pixelSize.value
    })
  }

  return {
    isErasing,
    initEraser,
    disposeEraser
  }
}