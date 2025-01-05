<script setup lang="ts">
import { useColorPickerStore } from "@/store";
import { storeToRefs } from "pinia";

const colorPickerStore = useColorPickerStore();
const { previewColor } = storeToRefs(colorPickerStore);
</script>
<template>
  <div class="preview-container">
    <div class="preview-background"></div>
    <div class="preview-color" :style="{ background: previewColor }">
    </div>
  </div>
</template>
<style scoped>
.preview-container {
  position: relative;
  width: 100px;
}
.preview-background {
  position: absolute;
  width: 100px;
  height: 100%;
  background-image: url('@/assets/alpha-background.svg');
  z-index: -1;
}
.preview-color {
  width: 100;
  height: 20px;
  box-sizing: border-box;
  border: 2px solid black;
}
</style>