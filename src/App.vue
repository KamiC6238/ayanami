<script setup lang="ts">
import { CSSProperties, onMounted, ref, useTemplateRef } from 'vue'
import { useCanvasStore, usePixelStore, useToolsStore } from '@/store'
import { useEraser, usePencil } from '@/hooks'
import { ToolTypeEnum } from '@/types';

const canvas = useTemplateRef('canvas');
const canvasStyle = ref<CSSProperties>({
  width: "600px",
  height: "600px",
  border: "1px solid black",
  imageRendering: "pixelated",
});

const { setToolType } = useToolsStore()
const { setCanvas } = useCanvasStore()
const pixelStore = usePixelStore()

usePencil()
useEraser()

onMounted(() => {
  if (canvas.value) {
    setCanvas(canvas.value)
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