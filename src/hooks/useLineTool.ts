import { watch, ref } from 'vue';
import { merge, Subscription, tap } from 'rxjs';
import { storeToRefs } from 'pinia';
import { useCanvasStore, useConfigStore } from '@/store';
import { Position, ToolTypeEnum } from '@/types';
import { useMouse } from './useMouse';
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
  const { mouseDown$, mouseMove$, mouseUp$, mouseLeave$, globalMouseUp$ } = useMouse()
  const { drawHoverPixel, setHoveredPixel } = useHoverPixel()

  const { canvas, displayCanvas, displayCanvasContext } = storeToRefs(canvasStore)
  const { toolType, pixelSize } = storeToRefs(configStore)

  watch(toolType, type => {
    if (type === ToolTypeEnum.Line) {
      initLineTool()
    } else {
      disposeLineTool()
    }
  })

  const disposeLineTool = () => line$.value?.unsubscribe()

  const initLineTool = () => {
    if (!canvas.value || !displayCanvas.value) {
      return
    }

    line$.value = merge(
      mouseDown$.value!.pipe(
        tap((event: MouseEvent) => {
          isDrawingLine.value = true
          drawLineStart(event)
        })
      ),
      mouseMove$.value!.pipe(
        tap((event: MouseEvent) => {
          if (isDrawingLine.value) {
            drawLineEnd(event)
          } else {
            drawHoverPixel(event)
          }
        })
      ),
      mouseUp$.value!.pipe(tap(() => tap(() => onMouseUpHandler()))),
      mouseLeave$.value!.pipe(
        tap(() => setHoveredPixel(null))
      ),
      globalMouseUp$.value!.pipe(tap(() => onMouseUpHandler()))
    ).subscribe()
  }

  const onMouseUpHandler = () => {
    drawBresenhamLine(canvasStore.canvasContext!)
    canvasStore.clearAllPixels(displayCanvasContext.value!)

    isDrawingLine.value = false
    lineStartPosition.value = null
    lineEndPosition.value = null
  }

  const drawLineStart = (event: MouseEvent) => {
    lineStartPosition.value = getPixelPosition(displayCanvas.value!, event)

    canvasStore.fillRect(
      lineStartPosition.value,
      displayCanvasContext.value!
    )
  }

  const drawLineEnd = (event: MouseEvent) => {
    lineEndPosition.value = getPixelPosition(displayCanvas.value!, event)
    canvasStore.clearAllPixels(displayCanvasContext.value!)
    drawBresenhamLine(displayCanvasContext.value!)
  }

  const drawBresenhamLine = (canvasContext: CanvasRenderingContext2D) => {
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
      canvasStore.fillRect({ x: startX, y: startY }, canvasContext)

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