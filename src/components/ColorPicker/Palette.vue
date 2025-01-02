<script setup lang="ts">
import { onMounted, useTemplateRef, ref, onBeforeUnmount } from 'vue'
import { fromEvent, merge, Subscription, tap, throttleTime } from 'rxjs'
import { calculateRGB, hslToRgb, drawHSLPalette } from '@/utils'
import { useColorPickerStore } from '@/store'

const isDragging = ref(false)
const mouse$ = ref<Subscription | null>(null)

const paletteRef = useTemplateRef('paletteRef')

const colorPickerStore = useColorPickerStore()

onMounted(() => {
  const canvas = paletteRef.value

  if (canvas) {
    colorPickerStore.setPalette(canvas)
    initPalette(canvas)
    initMouse$(canvas)
  }
})

onBeforeUnmount(() => mouse$.value?.unsubscribe())

const initPalette = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')

  if (ctx) {
    colorPickerStore.setRGB(hslToRgb({ h: 0, s: 100, l: 50 }))
    drawHSLPalette(ctx, 0)
  }
}

const initMouse$ = (canvas: HTMLCanvasElement) => {
  mouse$.value = merge(
    fromEvent<MouseEvent>(canvas, 'mousedown').pipe(
      tap((e) => {
        isDragging.value = true
        colorPickerStore.setRGB(calculateRGB(e, canvas))
      })
    ),
    fromEvent<MouseEvent>(canvas, 'mousemove').pipe(
      throttleTime(16),
      tap((e) => {
        if (!isDragging.value) return
        colorPickerStore.setRGB(calculateRGB(e, canvas))
      })
    ),
    fromEvent<MouseEvent>(canvas, 'mouseup').pipe(
      tap((e) => {
        isDragging.value = false
        colorPickerStore.setRGB(calculateRGB(e, canvas))
      })
    ),
  ).subscribe()
}
</script>
<template>
  <canvas class="palette" ref="paletteRef" />
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