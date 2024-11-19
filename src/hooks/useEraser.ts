import { onMounted, onUnmounted, ref, ShallowRef } from 'vue'
import { useMouse } from './useMouse'
import { merge, Subscription } from 'rxjs'

export interface EraserProps {
  canvas: Readonly<ShallowRef<HTMLCanvasElement | null>>
}

export function useEraser(props: EraserProps) {
  const erase$ = ref<Subscription>()
  const { mouseDown$, mouseMove$, mouseUp$ } = useMouse({ canvas: props.canvas })

  onMounted(() => initEraser())

  onUnmounted(() => disposeEraser())

  const initEraser = () =>  {
    if (
      !mouseDown$.value ||
      !mouseMove$.value ||
      !mouseUp$.value
    ) {
      return
    }

    erase$.value = merge(
      mouseDown$.value.pipe(),
      mouseMove$.value.pipe(),
      mouseUp$.value.pipe()
    ).subscribe()
  }

  const disposeEraser = () => erase$.value?.unsubscribe()
}