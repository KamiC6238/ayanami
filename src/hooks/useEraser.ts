import { watch, ref } from 'vue'
import { merge, Subscription, tap } from 'rxjs'
import { storeToRefs } from 'pinia'
import { useMouse } from './useMouse'
import { usePixels } from './usePixels'
import { useCanvasStore, usePixelToolsStore } from '../store'
import { ToolTypeEnum } from '../types'

export function useEraser() {
  const isErasing = ref(false);
  const erase$ = ref<Subscription>()

  const pixelToosStore = usePixelToolsStore()
  const canvasStore = useCanvasStore()
  const { mouseDown$, mouseMove$, mouseUp$ } = useMouse()
  const { erasePixel, getPixelPosition, drawHoverPixel } = usePixels()

  const { canvas } = storeToRefs(canvasStore)
  const { toolType } = storeToRefs(pixelToosStore)

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
          } else {
            const position = getPixelPosition(event)
            position && drawHoverPixel(position.x, position.y)
          }
        })
      ),
      mouseUp$.value!.pipe(
        tap(() => isErasing.value = false)
      )
    ).subscribe()
  }

  return {
    isErasing,
    initEraser,
    disposeEraser
  }
}