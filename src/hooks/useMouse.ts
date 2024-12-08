import { ref, watch } from 'vue'
import { Observable, fromEvent } from 'rxjs'
import { storeToRefs } from 'pinia'
import { useCanvasStore } from '@/store'

export function useMouse() {
  const mouseDown$ = ref<Observable<MouseEvent>>()
  const mouseMove$ = ref<Observable<MouseEvent>>()
  const mouseUp$ = ref<Observable<MouseEvent>>()
  const mouseLeave$ = ref<Observable<MouseEvent>>()

  const globalMouseUp$ = ref<Observable<MouseEvent>>(
    fromEvent<MouseEvent>(document, 'mouseup')
  )

  const canvasStore = useCanvasStore()
  const { displayCanvas } = storeToRefs(canvasStore)

  watch(displayCanvas, _canvas => {
    if (!_canvas) return

    mouseDown$.value = fromEvent<MouseEvent>(_canvas, 'mousedown')
    mouseMove$.value = fromEvent<MouseEvent>(_canvas, 'mousemove');
    mouseUp$.value = fromEvent<MouseEvent>(_canvas, 'mouseup');
    mouseLeave$.value = fromEvent<MouseEvent>(_canvas, 'mouseleave');
  })

  return {
    mouseDown$,
    mouseMove$,
    mouseUp$,
    mouseLeave$,

    globalMouseUp$,
  }
}