<script setup lang="ts">
import { CSSProperties, ref, useTemplateRef } from "vue";
import { useInitialization, usePencil } from './hooks'

const canvas = useTemplateRef('canvas');
const canvasStyle = ref<CSSProperties>({
  width: "600px",
  height: "600px",
  border: "1px solid black",
  imageRendering: "pixelated",
});

// 增加 useCanvas? 把 canvas 存到 store 里，用 pinia

useInitialization({ canvas })
usePencil({ canvas })
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
