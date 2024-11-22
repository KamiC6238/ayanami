import { watch, ref } from 'vue'
import { merge, Subscription, tap } from 'rxjs'
import { storeToRefs } from 'pinia'
import { useMouse } from './useMouse'
import { useCanvasStore, usePixelStore, useToolsStore } from '../store'
import { ToolTypeEnum } from '../types'

export function useEraser() {
  const isErasing = ref(false);
  const erase$ = ref<Subscription>()

  const pixelStore = usePixelStore()
  const toolsStore = useToolsStore()
  const canvasStore = useCanvasStore()
  const { mouseDown$, mouseMove$, mouseUp$, mouseLeave$ } = useMouse()

  const { canvas } = storeToRefs(canvasStore)
  const { toolType } = storeToRefs(toolsStore)

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
          pixelStore.erasePixel(event)
        })
      ),
      mouseMove$.value!.pipe(
        tap((event: MouseEvent) => {
          if (isErasing.value) {
            pixelStore.erasePixel(event)
          } else {
            pixelStore.drawHoverPixel(event)
          }
        })
      ),
      mouseUp$.value!.pipe(
        tap(() => isErasing.value = false)
      ),
      mouseLeave$.value!.pipe(
        tap(() => pixelStore.setHoveredPixel(null))
      )
    ).subscribe()
  }

  return {
    isErasing,
    initEraser,
    disposeEraser
  }
}