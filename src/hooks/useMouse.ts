import { ref, ShallowRef, computed, onMounted } from 'vue'
import { Observable, fromEvent } from 'rxjs'

interface Props {
  canvas: Readonly<ShallowRef<HTMLCanvasElement | null>>
}

export function useMouse(props: Props) {
  const mouseDown$ = ref<Observable<MouseEvent>>()
  const mouseMove$ = ref<Observable<MouseEvent>>()
  const mouseUp$ = ref<Observable<MouseEvent>>()

  const canvas = computed(() => props.canvas.value)

  onMounted(() => {
    if (!canvas.value) return

    mouseDown$.value = fromEvent<MouseEvent>(canvas.value, 'mousedown')
    mouseMove$.value = fromEvent<MouseEvent>(canvas.value, 'mousemove');
    mouseUp$.value = fromEvent<MouseEvent>(canvas.value, 'mouseup');
  })

  return {
    mouseDown$,
    mouseMove$,
    mouseUp$
  }
}