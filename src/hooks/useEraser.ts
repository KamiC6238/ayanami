import { onMounted, onUnmounted, ref } from 'vue'
import { useMouse } from './useMouse'
import { merge, Subscription } from 'rxjs'

export function useEraser() {
  const erase$ = ref<Subscription>()
  const { mouseDown$, mouseMove$, mouseUp$ } = useMouse()

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