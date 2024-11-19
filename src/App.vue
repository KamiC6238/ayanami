<script setup lang="ts">
import { CSSProperties, onMounted, ref, useTemplateRef } from "vue";
import { useCanvasStore } from './store'
import { useInitialization, usePencil } from './hooks'

const canvas = useTemplateRef('canvas');
const canvasStyle = ref<CSSProperties>({
  width: "600px",
  height: "600px",
  border: "1px solid black",
  imageRendering: "pixelated",
});

const { setCanvas } = useCanvasStore()

onMounted(() => {
  if (canvas.value) {
    setCanvas(canvas.value)
  }
})

useInitialization()
usePencil()
</script>

<template>
  <div class="container">
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
