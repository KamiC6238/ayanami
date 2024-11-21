<script setup lang="ts">
import { CSSProperties, onMounted, ref, useTemplateRef } from "vue";
import { useCanvasStore, useToolsStore } from './store'
import { useEraser, useInitialization, usePencil } from './hooks'
import { ToolTypeEnum } from './types';

const canvas = useTemplateRef('canvas');
const canvasStyle = ref<CSSProperties>({
  width: "600px",
  height: "600px",
  border: "1px solid black",
  imageRendering: "pixelated",
});

const { setToolType } = useToolsStore()
const { setCanvas } = useCanvasStore()

useInitialization()
usePencil()
useEraser()

onMounted(() => {
  if (canvas.value) {
    setCanvas(canvas.value)
  }
})
</script>

<template>
  <div class="container">
    <button @click="setToolType(ToolTypeEnum.Pencil)">pencil</button>
    <button @click="setToolType(ToolTypeEnum.Eraser)">eraser</button>
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
