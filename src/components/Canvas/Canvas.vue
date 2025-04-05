<script setup lang="ts">
import { useCanvasStore, useConfigStore } from "@/store";
import { ToolTypeEnum } from "@/types";
import { type CSSProperties, onMounted, ref, useTemplateRef } from "vue";

const canvas = useTemplateRef("canvas");
const previewCanvas = useTemplateRef("previewCanvas");
const gridCanvas = useTemplateRef("gridCanvas");
const canvasStyle = ref<CSSProperties>({
	width: "202px",
	height: "202px",
	borderWidth: "1px",
	borderStyle: "solid",
	borderColor: "rgba(0,0,0,0.02)",
	imageRendering: "pixelated",
});

const { initCanvas } = useCanvasStore();
const configStore = useConfigStore();

onMounted(() => {
	if (canvas.value && previewCanvas.value && gridCanvas.value) {
		initCanvas(gridCanvas.value as HTMLCanvasElement, { type: "grid" });
		initCanvas(canvas.value as HTMLCanvasElement, { type: "main" });
		initCanvas(previewCanvas.value as HTMLCanvasElement, { type: "preview" });
		configStore.setToolType(ToolTypeEnum.Pencil);
	}
});
</script>
<template>
  <div class="w-full h-full bg-[#635561] flex items-center justify-center">
    <div class="relative w-[202px] h-[202px]">
      <canvas ref="canvas" :style="canvasStyle" class="absolute top-0 bottom-0 left-0 right-0 z-9" />
      <canvas ref="previewCanvas" :style="canvasStyle" class="absolute top-0 bottom-0 left-0 right-0 z-10" />
      <canvas ref="gridCanvas" :style="canvasStyle" class="absolute top-0 bottom-0 left-0 right-0 z-8" />
    </div>
  </div>
</template>