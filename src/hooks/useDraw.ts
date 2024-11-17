import { ShallowRef, computed, ref } from 'vue'

export type PixelType = "draw" | "hover";

export interface Props {
  canvas: Readonly<ShallowRef<HTMLCanvasElement | null>>
}

function makePositionKey(x: number, y: number) {
  return `${x}-${y}`;
}

export function useDraw(props: Props) {
  const isDrawing = ref(false);
  const positionX = ref(0);
  const positionY = ref(0);
  const drawnPixels = ref<Set<string>>(new Set());
  const hoveredPixel = ref<{ x: number; y: number; }>({ x: 0, y: 0 });

  const canvasRef = computed(() => props.canvas.value)

  const scaleByDPR = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) => {
    const dpr = Math.floor(window.devicePixelRatio) || 1;
  
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx?.scale(dpr, dpr);
  };

  const initDrawer = () => {
    const canvas = canvasRef.value
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (ctx) {
      scaleByDPR(ctx, canvas)

      canvas.addEventListener("mousedown", (event) => {
        if (ctx) {
          isDrawing.value = true;
          drawPixel(event);
        }
      });
    
      canvas.addEventListener("mousemove", (event) => {
        if (isDrawing.value) {
          drawPixel(event);
        } else {
          const { x, y } = getDrawPosition(event);
          drawHoverPixel(x, y);
        }
      });
    
      canvas.addEventListener("mouseup", () => (isDrawing.value = false));
      canvas.addEventListener("mouseleave", () => (isDrawing.value = false));
    }
  }

  const checkIsDrawn = (x: number, y: number) => {
    return drawnPixels.value.has(makePositionKey(x, y));
  }

  const getDrawPosition = (event: MouseEvent) => {
    const canvas = canvasRef.value
    if (!canvas) {
      return { x: 0, y: 0 };
    }
  
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / 10) * 10;
    const y = Math.floor((event.clientY - rect.top) / 10) * 10;
  
    positionX.value = x;
    positionY.value = y;
  
    return { x, y };
  };
  
  const drawPixel = (event: MouseEvent) => {
    const canvas = canvasRef.value
    if (!canvas) return;
  
    const ctx = canvas.getContext("2d");
    const { x, y } = getDrawPosition(event);
  
    if (ctx) {
      ctx.fillStyle = "black";
      ctx.fillRect(x, y, 10, 10);
      drawnPixels.value.add(makePositionKey(x, y));
    }
  };

  const drawHoverPixel = (x: number, y: number) => {
    const canvas = canvasRef.value
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Remove the previous hovered pixel if it's not drawn and not the current position
      const pixel = hoveredPixel.value;
      if (pixel) {
        if (pixel.x === x && pixel.y === y) {
          return;
        } else if (!checkIsDrawn(pixel.x, pixel.y)) {
          ctx.clearRect(pixel.x, pixel.y, 10, 10);
        }
      }

      hoveredPixel.value = { x, y };
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(x, y, 10, 10);
    }
  }

  return {
    isDrawing,
    positionX,
    positionY,
    initDrawer,
  }
}