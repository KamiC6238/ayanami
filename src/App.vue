<script setup lang="ts">
import { CSSProperties, onMounted, ref, useTemplateRef } from 'vue'
import { useCanvasStore, useConfigStore } from '@/store'
import { useEraserTool, useLineTool, usePencilTool, useSquareTool } from '@/hooks'
import { ToolTypeEnum } from '@/types';

const canvas = useTemplateRef('canvas');
const previewCanvas = useTemplateRef('previewCanvas')
const gridCanvas = useTemplateRef('gridCanvas')
const canvasStyle = ref<CSSProperties>({
  width: "500px",
  height: "500px",
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(0,0,0,0.02)',
  imageRendering: "pixelated",
});

const configStore = useConfigStore()
const { initCanvas, clearAllPixels } = useCanvasStore()

usePencilTool()
useEraserTool()
useLineTool()
useSquareTool()

onMounted(() => {
  if (
    canvas.value &&
    previewCanvas.value &&
    gridCanvas.value
  ) {
    initCanvas(gridCanvas.value, { type: 'grid' })
    initCanvas(canvas.value, { type: 'main' })
    initCanvas(previewCanvas.value, { type: 'preview' })
    configStore.setToolType(ToolTypeEnum.Pencil)
  }
})

const onPixelSizeChange = (e: Event) => {
  configStore.setPixelSize(Number((e.target as HTMLInputElement).value))
}
</script>

<template>
  <div class="container">
    <div style="display: flex; margin-bottom: 20px;">
      <button style="margin-right: 10px" @click="configStore.setToolType(ToolTypeEnum.Pencil)">pencil</button>
      <button style="margin-right: 10px" @click="configStore.setToolType(ToolTypeEnum.Eraser)">eraser</button>
      <button style="margin-right: 10px" @click="configStore.setToolType(ToolTypeEnum.Line)">line</button>
      <button style="margin-right: 10px" @click="configStore.setToolType(ToolTypeEnum.Square)">square</button>
      <button style="margin-right: 10px" @click="() => clearAllPixels('main')">clear all pixels</button>
      <div style="display: flex;">
        <span>pixel size {{ configStore.pixelSize }}: </span>
        <input
          type="range"
          id='pixelSize'
          min="10"
          max="100"
          value="10"
          step="10"
          @input="onPixelSizeChange"
        />
      </div>
    </div>
    <div class="canvas-wrapper">
      <canvas ref="canvas" :style="canvasStyle" class="canvas" />
      <canvas ref="previewCanvas" :style="canvasStyle" class="preview-canvas" />
      <canvas ref="gridCanvas" :style="canvasStyle" class="grid-canvas" />
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.canvas-wrapper {
  position: relative;
  width: 500px;
  height: 500px;
}
.canvas,
.preview-canvas {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
.grid-canvas {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
.canvas {
  z-index: 9;
}
.preview-canvas {
  z-index: 10;
}
.grid-canvas {
  z-index: 8;
}
</style>