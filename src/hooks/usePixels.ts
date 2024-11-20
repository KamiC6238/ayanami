import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCanvasStore } from '../store';

function makePositionKey(x: number, y: number) {
  return `${x}-${y}`;
}

export function usePixels() {
  const positionX = ref(0);
  const positionY = ref(0);
  const drawnPixels = ref<Set<string>>(new Set());
  const hoveredPixel = ref<{ x: number; y: number; }>({ x: 0, y: 0 });

  const canvasStore = useCanvasStore()
  const { canvas, canvasContext } = storeToRefs(canvasStore)

  const checkIsDrawn = (x: number, y: number) => {
    return drawnPixels.value.has(makePositionKey(x, y));
  }

  const getPixelPosition = (event: MouseEvent) => {
    if (!canvas.value || !canvasContext.value) return null
  
    const rect = canvas.value.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / 10) * 10;
    const y = Math.floor((event.clientY - rect.top) / 10) * 10;
  
    positionX.value = x;
    positionY.value = y;
  
    return { x, y };
  };

  const drawPixel = (event: MouseEvent) => {
    const position = getPixelPosition(event);
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

  const erasePixel = (event: MouseEvent) => {
    const position = getPixelPosition(event);
    if (!canvas.value || !canvasContext.value || !position) return 

    const { x, y } = position

    canvasContext.value.clearRect(x, y, 10, 10);
    drawnPixels.value.delete(makePositionKey(x, y));
  }

  return {
    drawPixel,
    drawHoverPixel,
    erasePixel,
    checkIsDrawn,
    getPixelPosition,
  }
}