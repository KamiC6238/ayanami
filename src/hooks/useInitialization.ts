import { computed, ShallowRef, watch } from 'vue'

interface InitializationProps {
  canvas: Readonly<ShallowRef<HTMLCanvasElement | null>>
}

export function useInitialization(props: InitializationProps) {
  const canvas = computed(() => props.canvas.value)
  const canvasCtx = computed(() => canvas.value?.getContext('2d'))

  watch(() => canvas.value, _canvas => {
    if (_canvas) {
      scaleCanvasByDPR()
    }
  })

  const scaleCanvasByDPR = () => {
    if (!canvas.value || !canvasCtx.value) return

    const dpr = Math.floor(window.devicePixelRatio) || 1;
  
    canvas.value.width = canvas.value.clientWidth * dpr;
    canvas.value.height = canvas.value.clientHeight * dpr;
    canvasCtx.value.scale(dpr, dpr);
  }
}