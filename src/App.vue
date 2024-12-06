<script setup lang="ts">
import { CSSProperties, onMounted, ref, useTemplateRef } from 'vue'
import { useCanvasStore, usePixelStore, useToolsStore } from '@/store'
import { useEraser, usePencil } from '@/hooks'
import { ToolTypeEnum } from '@/types';

const canvas = useTemplateRef('canvas');
const displayCanvas = useTemplateRef('displayCanvas')
const canvasStyle = ref<CSSProperties>({
  width: "600px",
  height: "600px",
  border: "1px solid black",
  imageRendering: "pixelated",
});

const { setToolType } = useToolsStore()
const { setCanvas, setDisplayCanvas, clearAllPixels } = useCanvasStore()
const pixelStore = usePixelStore()

usePencil()
useEraser()

onMounted(() => {
  if (canvas.value && displayCanvas.value) {
    setCanvas(canvas.value)
    setDisplayCanvas(displayCanvas.value)
    setToolType(ToolTypeEnum.Pencil)
  }
})

const onPixelSizeChange = (e: Event) => {
  pixelStore.setPixelSize(Number((e.target as HTMLInputElement).value))
}
</script>

<template>
  <div class="container">
    <div style="display: flex; margin-bottom: 20px;">
      <button style="margin-right: 10px" @click="setToolType(ToolTypeEnum.Pencil)">pencil</button>
      <button style="margin-right: 10px" @click="setToolType(ToolTypeEnum.Eraser)">eraser</button>
      <button style="margin-right: 10px" @click="clearAllPixels">clear all pixels</button>
      <div style="display: flex;">
        <span>pixel size {{ pixelStore.pixelSize }}: </span>
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
      <canvas ref="displayCanvas" :style="canvasStyle" class="display-canvas" />
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
  width: 600px;
  height: 600px;
}
.canvas,
.display-canvas {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
.canvas {
  z-index: 9;
}
.display-canvas {
  z-index: 10;
}
</style>