<script setup lang="ts">
// import { type CSSProperties, computed } from 'vue'
import { makeRGB } from '@/utils'
import { useColorPickerStore } from '@/store';
import { storeToRefs } from 'pinia';

const colorPickerStore = useColorPickerStore()
const { rgb } = storeToRefs(colorPickerStore)

// const borderStyle = computed<CSSProperties>(() => ({
//   borderStyle: 'solid',
//   borderWidth: '4px',
//   borderColor: makeRGB(rgb.value),
//   borderImageSlice: 4,
//   borderImageOutset: 0,
// }))
</script>
<template>
  <div class="pixel-border">
    <div class="pixel-border-layer-1" :style="{ background: makeRGB(rgb) }"></div>
  </div>
</template>
<style scoped>
.pixel-border {
  position: relative;
  border-style: solid;
  border-width: 4px;
  border-color: #000;
  border-image-slice: 4;
  border-image-width: 2;
  border-image-outset: 0;
  border-image-source: url('@/assets/pixelBorder.svg');
  padding: 15px 20px;
}
.pixel-border-layer-1,
.pixel-border-layer-2 {
  width: 100px;
  height: 40px;
}
</style>