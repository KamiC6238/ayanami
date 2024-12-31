<script lang="ts" setup>
import { type CSSProperties, computed } from 'vue'
import type { RGB } from '@/types'
import { hslToRgb, makeRGB, rgbToHsl } from '@/utils'

interface Props {
  rgb: RGB
}

const props = defineProps<Props>()

const borderStyle = computed<CSSProperties>(() => ({
  borderStyle: 'solid',
  borderWidth: '4px',
  borderColor: makeRGB(props.rgb),
  borderImageSlice: 4,
  borderImageOutset: 0,
}))
</script>
<template>
  <div class="pixel-border">
    <div class="pixel-border-layer-1" :style="{ background: makeRGB(props.rgb) }"></div>
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