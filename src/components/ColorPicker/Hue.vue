<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
import { drawHSLPalette, hslToRgb } from '@/utils';
import { useColorPickerStore } from '@/store';
import { storeToRefs } from 'pinia';

const hueRef = useTemplateRef('hue')

const colorPickerStore = useColorPickerStore()
const { palette, hsl } = storeToRefs(colorPickerStore)

onMounted(() => {
  const hue = hueRef.value

  if (hue) {
    hue.addEventListener("click", (e) => {
      const ctx = palette.value?.getContext('2d')

      if (ctx) {
        const rect = hue.getBoundingClientRect()
        const curHue = Math.round((e.clientX - rect.left) / rect.width * 360)
        const curHSL = { ...hsl.value, h: curHue }

        colorPickerStore.setRGB(hslToRgb(curHSL))

        drawHSLPalette(ctx, curHue)
      }
    });
  }
})
</script>
<template>
  <div class="hue" ref="hue" />
</template>
<style scoped>
.hue {
  width: 100px;
  height: 10px;
  background: linear-gradient(
    to right,
    hsl(0,100%,50%),
    hsl(60,100%,50%),
    hsl(120,100%,50%),
    hsl(180,100%,50%),
    hsl(240,100%,50%),
    hsl(300,100%,50%),
    hsl(360,100%,50%)
  )
}
</style>