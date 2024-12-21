import { watch, ref } from 'vue';
import { merge, Subscription, tap, throttleTime } from 'rxjs';
import { storeToRefs } from 'pinia';
import { useCanvasStore, useConfigStore } from '@/store';
import { CanvasType, Position, ToolTypeEnum } from '@/types';
import { useHoverPixel } from './useHover';
import { getPixelPosition } from '@/utils';

const getAlignedStartAndEndPosition = (
  lineStartPosition: Position,
  lineEndPosition: Position,
  pixelSize: number
) => {
  let { x: startX, y: startY } = lineStartPosition
  let { x: endX, y: endY } = lineEndPosition

  startX = Math.floor(startX / pixelSize) * pixelSize
  startY = Math.floor(startY / pixelSize) * pixelSize
  endX = Math.floor(endX / pixelSize) * pixelSize
  endY = Math.floor(endY / pixelSize) * pixelSize

  return {
    startX,
    startY,
    endX,
    endY
  }
}

export function useLineTool() {
  const isDrawingLine = ref(false)
  const lineStartPosition = ref<Position | null>(null)
  const lineEndPosition = ref<Position | null>(null)
  const line$ = ref<Subscription>()

  const configStore = useConfigStore()
  const canvasStore = useCanvasStore()
  const { drawHoverPixel, setHoveredPixel } = useHoverPixel()

  const { toolType, pixelSize } = storeToRefs(configStore)
  const { mouseDown$, mouseLeave$, mouseMove$, mouseUp$, globalMouseUp$} = storeToRefs(canvasStore)

  watch(toolType, type => {
    if (type === ToolTypeEnum.Line) {
      initLineTool()
    } else {
      disposeLineTool()
    }
  })

  const disposeLineTool = () => line$.value?.unsubscribe()

  const initLineTool = () => {
    line$.value = merge(
      mouseDown$.value!.pipe(
        tap((event: MouseEvent) => {
          isDrawingLine.value = true
          drawLineStart(event)
        })
      ),
      mouseMove$.value!.pipe(
        throttleTime(16),
        tap((event: MouseEvent) => {
          if (isDrawingLine.value) {
            drawLineEnd(event)
          } else {
            drawHoverPixel(event)
          }
        })
      ),
      mouseUp$.value!.pipe(tap(() => tap(() => onMouseUpHandler()))),
      mouseLeave$.value!.pipe(tap(() => setHoveredPixel(null))),
      globalMouseUp$.value!.pipe(tap(() => onMouseUpHandler()))
    ).subscribe()
  }

  const onMouseUpHandler = () => {
    drawBresenhamLine('main')
    canvasStore.clearAllPixels('preview')

    isDrawingLine.value = false
    lineStartPosition.value = null
    lineEndPosition.value = null
  }

  const drawLineStart = (event: MouseEvent) => {
    const canvas = canvasStore.getCanvas('preview')

    if (canvas) {
      lineStartPosition.value = getPixelPosition(canvas, event)

      canvasStore.fillRect({
        position: lineStartPosition.value,
        canvasType: 'main'
      })
    }
  }

  const drawLineEnd = (event: MouseEvent) => {
    const canvas = canvasStore.getCanvas('preview')
    lineEndPosition.value = getPixelPosition(canvas!, event)
    canvasStore.clearAllPixels('preview')
    drawBresenhamLine('preview')
  }

  const drawBresenhamLine = (canvasType: CanvasType) => {
    if (!lineStartPosition.value || !lineEndPosition.value) {
      return
    }

    let { startX, startY, endX, endY } = getAlignedStartAndEndPosition(
      lineStartPosition.value,
      lineEndPosition.value,
      pixelSize.value
    )

    let dx = Math.abs(endX - startX)
    let dy = Math.abs(endY - startY)
    let sx = startX < endX ? pixelSize.value : -pixelSize.value
    let sy = startY < endY ? pixelSize.value : -pixelSize.value
    let err = dx - dy

    while (true) {
      canvasStore.fillRect({
        position: { x: startX, y: startY },
        canvasType
      })

      if (startX === endX && startY === endY) {
        break
      }

      let e2 = err * 2

      if (e2 > -dy) {
        err -= dy
        startX += sx
      }
      if (e2 < dx) {
        err += dx
        startY += sy
      }
    }
  }
}