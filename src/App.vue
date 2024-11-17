<script setup lang="ts">
import { CSSProperties, onMounted, ref, useTemplateRef } from "vue";
import { useDraw } from './hooks'

const canvas = useTemplateRef('canvas');
const canvasStyle = ref<CSSProperties>({
  width: "600px",
  height: "600px",
  border: "1px solid black",
  imageRendering: "pixelated",
});

const { positionX, positionY, initDrawer } = useDraw({ canvas })

onMounted(() => {
  initDrawer()
});
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
