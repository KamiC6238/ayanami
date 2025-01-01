<script lang="ts" setup>
import { onMounted, useTemplateRef } from 'vue'
import { PixelBorder } from '@/components/Pixel'
import { useColorPicker } from '@/hooks'

const paletteRef = useTemplateRef('paletteRef')

const { init }  = useColorPicker()

onMounted(() => {
  const canvas = paletteRef.value
  canvas && init(canvas)
})
</script>
<template>
  <canvas class="palette" ref="paletteRef" />
  <PixelBorder />
</template>
<style scoped>
.palette {
  display: flex;
  flex-direction: column;
  width: 100px;
  height: 100px;
}
.color-preview {
  width: 100px;
  height: 40px;
}
</style>