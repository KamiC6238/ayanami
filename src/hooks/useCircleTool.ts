import { watch, ref } from 'vue'
import { merge, Subscription, tap, throttleTime } from 'rxjs'
import { storeToRefs } from 'pinia'
import { useCanvasStore, useConfigStore } from '@/store'
import { CanvasType, Position, ToolTypeEnum } from '@/types'
import { getPixelPosition } from '@/utils'
import { useHoverPixel } from './useHover'

export function useCircleTool() {
  const isDrawingCircle = ref(false)
  const circleStartPosition = ref<Position | null>()
  const circleEndPosition = ref<Position | null>()
  const circle$ = ref<Subscription>()

  const configTool = useConfigStore()
  const canvasStore = useCanvasStore()
  const { drawHoverPixel, setHoveredPixel } = useHoverPixel()

  const { toolType } = storeToRefs(configTool)
  const { mouseDown$, mouseLeave$, mouseMove$, mouseUp$, globalMouseUp$} = storeToRefs(canvasStore)

  watch(toolType, type => {
    if (type === ToolTypeEnum.Circle) {
      initCircle()
    } else {
      disposeCircle()
    }
  })

  const disposeCircle = () => circle$.value?.unsubscribe()

  const initCircle = () => {
    circle$.value = merge(
      mouseDown$.value!.pipe(
        tap((event: MouseEvent) => {
          isDrawingCircle.value = true
          drawCircleStart(event)
          setHoveredPixel(null)
        })
      ),
      mouseMove$.value!.pipe(
        throttleTime(16),
        tap((event: MouseEvent) => {
          if (isDrawingCircle.value) {
            drawCircleEnd(event)
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
    drawCircle('main')
    isDrawingCircle.value = false
    circleStartPosition.value = null
    circleEndPosition.value = null
  }

  const drawCircleStart = (event: MouseEvent) => {}

  const drawCircleEnd = (event: MouseEvent) => {}

  const drawCircle = (canvasType: CanvasType) => {}
}