<script setup lang="ts">
import FrameAnimation from "@/components/Frames/FrameAnimation.vue";
import { useCanvasStore, useFramesStore } from "@/store";
import type { CanvasType } from "@/types";
import { cn } from "@/utils";
import { type CSSProperties, onMounted, ref, useTemplateRef } from "vue";

const canvas = useTemplateRef("canvas");
const previewCanvas = useTemplateRef("previewCanvas");
const gridCanvas = useTemplateRef("gridCanvas");
const canvasStyle = ref<CSSProperties>({
	width: "264px",
	height: "264px",
	borderWidth: "1px",
	borderStyle: "solid",
	borderColor: "rgba(0,0,0,0.02)",
	imageRendering: "pixelated",
});

const { initCanvas } = useCanvasStore();
const framesStore = useFramesStore();

const getCanvasCls = (type: CanvasType, zIndex: number) => {
	return cn(`
    absolute
    top-0 bottom-0 left-0 z-${zIndex}
    ${framesStore.isFramesPlaying && type !== "grid" ? "hidden" : "block"}
  `);
};

onMounted(() => {
	if (canvas.value && previewCanvas.value && gridCanvas.value) {
		initCanvas(
			gridCanvas.value as HTMLCanvasElement,
			canvas.value as HTMLCanvasElement,
			previewCanvas.value as HTMLCanvasElement,
		);
	}
});
</script>
<template>
  <div class="w-full h-full bg-[#635561] flex items-center justify-center">
    <div class="relative w-[264px] h-[264px]">
      <canvas ref="gridCanvas" :style="canvasStyle" :class="getCanvasCls('grid', 8)" />
      <canvas ref="canvas" :style="canvasStyle" :class="getCanvasCls('main', 9)" />
      <canvas ref="previewCanvas" :style="canvasStyle" :class="getCanvasCls('preview', 10)" />
      <FrameAnimation />
    </div>
  </div>
</template>