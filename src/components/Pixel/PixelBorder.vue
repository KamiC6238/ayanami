<script setup lang="ts">
// import { type CSSProperties, computed } from 'vue'

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
    <slot />
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
}
</style>