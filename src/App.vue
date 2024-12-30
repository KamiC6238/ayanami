<script setup lang="ts">
import { CSSProperties, onMounted, ref, useTemplateRef } from 'vue'
import { useCanvasStore, useConfigStore } from '@/store'
import { useEraserTool, useLineTool, usePencilTool, useSquareTool } from '@/hooks'
import { CircleTypeEnum, ToolTypeEnum } from '@/types';
import { useCircleTool } from './hooks/useCircleTool';
import ColorPicker from '@/components/ColorPicker/index.vue'

const tools = [
  ToolTypeEnum.Pencil,
  ToolTypeEnum.Eraser,
  ToolTypeEnum.Line,
  ToolTypeEnum.Square,
  ToolTypeEnum.Circle
]

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
const { setCircleType } = useCircleTool()

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

const onCircleTypeChange = (e: any) => {
  setCircleType(e.target!.value as CircleTypeEnum)
}
</script>

<template>
  <div class="container">
    <div style="display: flex; flex-direction: column; margin-bottom: 20px;">
      <div style='display: flex; flex-direction: column; width: 100px;'>
        <button
          v-for="toolType of tools"
          style='width: 100px; margin-bottom: 10px;'
          @click="() => configStore.setToolType(toolType)"
        >
          {{ toolType }}
        </button>
        <select :value="CircleTypeEnum.Circle" @change="onCircleTypeChange" style='margin-bottom: 10px;'>
           <option :value="CircleTypeEnum.Circle">圆形</option>
           <option :value="CircleTypeEnum.Ellipse">椭圆</option>
         </select>
        <button style="margin-bottom: 10px" @click="() => clearAllPixels('main')">clear</button>
      </div>
      <ColorPicker />
      <div style="display: flex; flex-direction: column; margin-top: 10px" >
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
<style>
@font-face {
  font-family: 'pixel-font';
  src: url('@/assets/pixel.ttf');
}
</style>
<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
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