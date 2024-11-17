<script setup lang="ts">
import { CSSProperties, onMounted, ref } from "vue";

type PixelType = "draw" | "hover";

const canvas = ref<HTMLCanvasElement | null>(null);
const canvasStyle = ref<CSSProperties>({
  width: "600px",
  height: "600px",
  border: "1px solid black",
  imageRendering: "pixelated",
});

const isDrawing = ref(false);
const positionX = ref(0);
const positionY = ref(0);
const hoveredPixel = ref<{
  type: PixelType;
  x: number;
  y: number;
} | null>(null);

onMounted(() => {
  const canvasRef = canvas.value;

  if (!canvasRef) return;

  const ctx = canvasRef.getContext("2d");

  scaleByDPR();

  canvasRef.addEventListener("mousedown", (event) => {
    if (ctx) {
      isDrawing.value = true;
      drawPixel(event);
    }
  });

  canvasRef.addEventListener("mousemove", (event) => {
    if (isDrawing.value) {
      drawPixel(event);
    } else {
      const ctx = canvas.value?.getContext("2d");
      const { x, y } = getDrawPosition(event);

      if (ctx) {
        console.log(ctx.getImageData(x, y, 10, 10));
        const pixel = hoveredPixel.value;

        // 解决绘制后，在绘制区域内移动时被 hoveredPixel 覆盖的问题
        if (pixel) {
          if (pixel.x === x && pixel.y === y) {
            return;
          } else if (pixel.type === "hover") {
            /**
             * 当鼠标位置离开当前位置后，如果当前位置没被绘制过，
             * 那么清除掉对应的 hoveredPixel
             */
            ctx.clearRect(pixel.x, pixel.y, 10, 10);
          }
        }

        hoveredPixel.value = {
          type: "hover",
          x,
          y,
        };

        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(x, y, 10, 10);
      }
    }
  });

  canvasRef.addEventListener("mouseup", () => (isDrawing.value = false));
  canvasRef.addEventListener("mouseleave", () => (isDrawing.value = false));
});

const scaleByDPR = () => {
  const canvasRef = canvas.value;

  if (!canvasRef) return;

  const ctx = canvasRef.getContext("2d");
  const dpr = Math.floor(window.devicePixelRatio) || 1;

  canvasRef.width = canvasRef.clientWidth * dpr;
  canvasRef.height = canvasRef.clientHeight * dpr;
  ctx?.scale(dpr, dpr);
};

const getDrawPosition = (event: MouseEvent) => {
  const canvasRef = canvas.value;

  if (!canvasRef) return { x: 0, y: 0 };

  const rect = canvasRef.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / 10) * 10;
  const y = Math.floor((event.clientY - rect.top) / 10) * 10;

  positionX.value = x;
  positionY.value = y;

  return { x, y };
};

const drawPixel = (event: MouseEvent) => {
  const canvasRef = canvas.value;

  if (!canvasRef) return;

  const ctx = canvasRef.getContext("2d");
  const { x, y } = getDrawPosition(event);

  if (ctx) {
    ctx.fillStyle = "black";
    ctx.fillRect(x, y, 10, 10);

    console.log(ctx?.getImageData(x, y, 10, 10));

    /**
     * 绘制像素后，把 hoveredPixel 的 type 改为 'draw' 表示绘制过了，
     * 避免鼠标离开后把该位置的像素给 clear 掉
     */
    if (hoveredPixel.value) {
      hoveredPixel.value.type = "draw";
    }
  }
};
</script>

<template>
  <div class="container">
    <div>
      <span style="margin-right: 10px">X: {{ positionX }}</span>
      <span>Y: {{ positionY }}</span>
    </div>
    <canvas ref="canvas" :style="canvasStyle" />
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>
