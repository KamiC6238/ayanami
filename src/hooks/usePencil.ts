import { watch, onUnmounted, ref } from 'vue'
import { tap, merge, Subscription } from 'rxjs'
import { storeToRefs } from 'pinia'
import { useMouse } from './useMouse'
import { useCanvasStore } from '../store';

function makePositionKey(x: number, y: number) {
  return `${x}-${y}`;
}

export function usePencil() {
  const isDrawing = ref(false);
  const positionX = ref(0);
  const positionY = ref(0);
  const drawnPixels = ref<Set<string>>(new Set());
  const hoveredPixel = ref<{ x: number; y: number; }>({ x: 0, y: 0 });
  const draw$ = ref<Subscription>()

  const canvasStore = useCanvasStore()
  const { mouseDown$, mouseMove$, mouseUp$ } = useMouse()

  const { canvas, canvasContext } = storeToRefs(canvasStore)

  watch(canvas, _canvas => {
    if (!_canvas) return
    initPencil()
  })

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
    if (!canvas.value || !canvasContext.value) return null
  
    const rect = canvas.value.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / 10) * 10;
    const y = Math.floor((event.clientY - rect.top) / 10) * 10;
  
    positionX.value = x;
    positionY.value = y;
  
    return { x, y };
  };
  
  const drawPixel = (event: MouseEvent) => {
    const position = getDrawPosition(event);
    if (!canvas.value || !canvasContext.value || !position) return 

    const { x, y } = position
  
    canvasContext.value.fillStyle = "black";
    canvasContext.value.fillRect(x, y, 10, 10);
    drawnPixels.value.add(makePositionKey(x, y));
  };

  const drawHoverPixel = (x: number, y: number) => {
    const pixel = hoveredPixel.value;

    if (!pixel || !canvas.value || !canvasContext.value) return

    // Remove the previous hovered pixel if it's not drawn
    if (!checkIsDrawn(pixel.x, pixel.y)) {
      canvasContext.value.clearRect(pixel.x, pixel.y, 10, 10);
    }

    hoveredPixel.value = { x, y };
    canvasContext.value.fillStyle = "rgba(0, 0, 0, 0.5)";
    canvasContext.value.fillRect(x, y, 10, 10);
  }

  return {
    isDrawing,
    positionX,
    positionY,
  }
}