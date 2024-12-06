import { watch, ref } from 'vue'
import { merge, Subscription, tap } from 'rxjs'
import { storeToRefs } from 'pinia'
import { useCanvasStore, usePixelStore, useToolsStore } from '@/store'
import { ToolTypeEnum } from '@/types'
import { useMouse } from './useMouse'

export function useEraser() {
  const isErasing = ref(false);
  const erase$ = ref<Subscription>()

  const pixelStore = usePixelStore()
  const toolsStore = useToolsStore()
  const canvasStore = useCanvasStore()
  const { mouseDown$, mouseMove$, mouseUp$, mouseLeave$, globalMouseUp$ } = useMouse()

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
          }
          pixelStore.drawHoverPixel(event)
        })
      ),
      mouseUp$.value!.pipe(
        tap(() => isErasing.value = false)
      ),
      mouseLeave$.value!.pipe(
        tap(() => pixelStore.setHoveredPixel(null))
      ),
      globalMouseUp$.value!.pipe(
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