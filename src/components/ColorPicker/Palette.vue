<script lang="ts" setup>
import { onMounted, useTemplateRef, ref } from 'vue'
import { fromEvent, merge, tap, throttleTime } from 'rxjs'
import { drawHSLPalette, calculateRGB, hslToRgb, makeRGB } from '@/utils'
import type { RGB } from '@/types'
import { PixelBorder } from '@/components/Pixel'

const rgb = ref<RGB>({ r: 0, g: 0, b: 0 })
const pickedRGB = ref<RGB | null>(null)

const paletteRef = useTemplateRef('paletteRef')

onMounted(() => initPalette())

const initPalette = () => {
  if (!paletteRef.value) return

  const hsl = {
    h: 0,
    s: 100,
    l: 50
  }
  const _rgb = hslToRgb(hsl.h, hsl.s, hsl.l)
  const ctx = paletteRef.value.getContext('2d')

  rgb.value = { ..._rgb }
  pickedRGB.value = { ..._rgb }

  ctx && drawHSLPalette(ctx, hsl)
  initCavnasListener()
}

const initCavnasListener = () => {
  const canvas = paletteRef.value

  if (canvas) {
    merge(
      fromEvent<MouseEvent>(canvas, 'mousedown').pipe(
        tap((event) => {
          rgb.value = calculateRGB(event, canvas)
        })
      ),
      fromEvent<MouseEvent>(canvas, 'mousemove').pipe(
        throttleTime(16),
        tap((event) => {
          rgb.value = calculateRGB(event, canvas)
        })
      ),
      fromEvent<MouseEvent>(canvas, 'mouseup').pipe(
        tap(() => {
          pickedRGB.value = { ...rgb.value! }
        })
      ),
    ).subscribe()
  }
}
</script>
<template>
  <canvas class="palette" ref="paletteRef" />
  <PixelBorder :rgb="rgb" />
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