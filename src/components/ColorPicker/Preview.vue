<script setup lang="ts">
import { useColorPickerStore } from "@/store";
import { storeToRefs } from "pinia";

const colorPickerStore = useColorPickerStore();
const { previewColor } = storeToRefs(colorPickerStore);
</script>
<template>
  <div class="color-preview">
    <div class="color-preview__background"></div>
    <div class="color-preview__color" :style="{ background: previewColor }">
    </div>
  </div>
</template>
<style scoped>
.color-preview {
  position: relative;
  width: 100%;
  &__background {
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: url('@/assets/alpha-background.svg');
    z-index: -1;
  }
  &__color {
    width: 100%;
    height: 20px;
    box-sizing: border-box;
    border: 2px solid black;
  }
}
</style>