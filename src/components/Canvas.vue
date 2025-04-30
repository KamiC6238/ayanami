<script setup lang="ts">
import { useCanvasStore, useConfigStore } from "@/store";
import { ToolTypeEnum } from "@/types";
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
const configStore = useConfigStore();

const getCanvasCls = (zIndex: number) =>
	cn(`absolute top-0 bottom-0 left-0 z-${zIndex}`);

onMounted(() => {
	if (canvas.value && previewCanvas.value && gridCanvas.value) {
		initCanvas(
			gridCanvas.value as HTMLCanvasElement,
			canvas.value as HTMLCanvasElement,
			previewCanvas.value as HTMLCanvasElement,
		);

		if (configStore.toolType === ToolTypeEnum.Unknown) {
			configStore.setToolType(ToolTypeEnum.Pencil);
		}
	}
});
</script>
<template>
  <div class="w-full h-full bg-[#635561] flex items-center justify-center">
    <div class="relative w-[264px] h-[264px]">
      <canvas ref="gridCanvas" :style="canvasStyle" :class="getCanvasCls(8)" />
      <canvas ref="canvas" :style="canvasStyle" :class="getCanvasCls(9)" />
      <canvas ref="previewCanvas" :style="canvasStyle" :class="getCanvasCls(10)" />
    </div>
  </div>
</template>