import { ShallowRef, computed, onMounted, onUnmounted, ref } from 'vue'
import { tap, merge, Subscription } from 'rxjs'
import { useMouse } from './useMouse'

export interface PencilProps {
  canvas: Readonly<ShallowRef<HTMLCanvasElement | null>>
}

function makePositionKey(x: number, y: number) {
  return `${x}-${y}`;
}

export function usePencil(props: PencilProps) {
  const isDrawing = ref(false);
  const positionX = ref(0);
  const positionY = ref(0);
  const drawnPixels = ref<Set<string>>(new Set());
  const hoveredPixel = ref<{ x: number; y: number; }>({ x: 0, y: 0 });
  const draw$ = ref<Subscription>()

  const { mouseDown$, mouseMove$, mouseUp$ } = useMouse({ canvas: props.canvas })

  const canvas = computed(() => props.canvas.value)

  const canvasCtx = computed(() => canvas.value?.getContext('2d'))

  onMounted(() => initPencil())

  onUnmounted(() => disposePencil())

  const initPencil = () => {
    draw$.value = merge(
      mouseDown$.value!.pipe(
        tap((event: MouseEvent) => {
          isDrawing.value = true
          drawPixel(event)
        })
      ),
      mouseMove$.value!.pipe(
        tap((event: MouseEvent) => {
          if (isDrawing.value) {
            drawPixel(event)
          } else {
            const position = getDrawPosition(event)
            position && drawHoverPixel(position.x, position.y)
          }
        })
      ),
      mouseUp$.value!.pipe(
        tap(() => isDrawing.value = false)
      ),
    ).subscribe()
  }

  const disposePencil = () => {
    draw$.value?.unsubscribe()
  }

  const checkIsDrawn = (x: number, y: number) => {
    return drawnPixels.value.has(makePositionKey(x, y));
  }

  const getDrawPosition = (event: MouseEvent) => {
    if (!canvas.value || !canvasCtx.value) return null
  
    const rect = canvas.value.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / 10) * 10;
    const y = Math.floor((event.clientY - rect.top) / 10) * 10;
  
    positionX.value = x;
    positionY.value = y;
  
    return { x, y };
  };
  
  const drawPixel = (event: MouseEvent) => {
    const position = getDrawPosition(event);
    if (!canvas.value || !canvasCtx.value || !position) return 

    const { x, y } = position
  
    canvasCtx.value.fillStyle = "black";
    canvasCtx.value.fillRect(x, y, 10, 10);
    drawnPixels.value.add(makePositionKey(x, y));
  };

  const drawHoverPixel = (x: number, y: number) => {
    const pixel = hoveredPixel.value;

    if (!pixel || !canvas.value || !canvasCtx.value) return

    // Remove the previous hovered pixel if it's not drawn
    if (!checkIsDrawn(pixel.x, pixel.y)) {
      canvasCtx.value.clearRect(pixel.x, pixel.y, 10, 10);
    }

    hoveredPixel.value = { x, y };
    canvasCtx.value.fillStyle = "rgba(0, 0, 0, 0.5)";
    canvasCtx.value.fillRect(x, y, 10, 10);
  }

  return {
    isDrawing,
    positionX,
    positionY,
  }
}