import { watch, ref } from 'vue'
import { merge, Subscription, tap, throttleTime } from 'rxjs'
import { storeToRefs } from 'pinia'
import { useCanvasStore, useConfigStore } from '@/store'
import { CanvasType, Position, ToolTypeEnum } from '@/types'
import { getPixelPosition } from '@/utils'
import { useHoverPixel } from './useHover'

export function useSquareTool() {
  const isDrawingSquare = ref(false)
  const squareStartPosition = ref<Position | null>()
  const squareEndPosition = ref<Position | null>()
  const square$ = ref<Subscription>()

  const configTool = useConfigStore()
  const canvasStore = useCanvasStore()
  const { drawHoverPixel, setHoveredPixel } = useHoverPixel()

  const { toolType } = storeToRefs(configTool)
  const { mouseDown$, mouseLeave$, mouseMove$, mouseUp$, globalMouseUp$} = storeToRefs(canvasStore)

  watch(toolType, type => {
    if (type === ToolTypeEnum.Square) {
      initSquare()
    } else {
      disposeSquare()
    }
  })

  const disposeSquare = () => square$.value?.unsubscribe()

  const initSquare = () => {
    square$.value = merge(
      mouseDown$.value!.pipe(
        tap((event: MouseEvent) => {
          isDrawingSquare.value = true
          drawSquareStart(event)
          setHoveredPixel(null)
        })
      ),
      mouseMove$.value!.pipe(
        throttleTime(16),
        tap((event: MouseEvent) => {
          if (isDrawingSquare.value) {
            drawSquareEnd(event)
          } else {
            drawHoverPixel(event)
          }
        })
      ),
      mouseUp$.value!.pipe(tap(() => onMouseUpHandler())),
      mouseLeave$.value!.pipe(tap(() => setHoveredPixel(null))),
      globalMouseUp$.value!.pipe(tap(() => onMouseUpHandler()))
    ).subscribe()
  }

  const onMouseUpHandler = () => {
    drawSquare('main')
    canvasStore.clearAllPixels('preview')
    isDrawingSquare.value = false
    squareStartPosition.value = null
    squareEndPosition.value = null
  }

  const drawSquareStart = (event: MouseEvent) => {
    const canvas = canvasStore.getCanvas('preview')

    if (canvas) {
      const position = getPixelPosition(canvas, event)
      squareStartPosition.value = position
      squareEndPosition.value = position
    }
  }

  const drawSquareEnd = (event: MouseEvent) => {
    const context = canvasStore.getCanvasContext('preview')

    if (!squareStartPosition.value) return

    if (context) {
      canvasStore.clearAllPixels('preview')
      squareEndPosition.value = getPixelPosition(context.canvas, event)

      drawSquare('preview')
    }
  }

  const drawSquare = (canvasType: CanvasType) => {
    if (!squareStartPosition.value || !squareEndPosition.value) {
      return
    }

    canvasStore.strokeRect({
      position: squareStartPosition.value,
      canvasType,
      endPosition: squareEndPosition.value
    })
  }
}