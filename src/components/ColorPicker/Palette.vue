<script setup lang="ts">
import { onMounted, useTemplateRef, ref, onBeforeUnmount } from 'vue'
import { fromEvent, merge, Subscription, tap } from 'rxjs'
import { calculateRGB, hslToRgb, drawHSLPalette } from '@/utils'
import { useColorPickerStore } from '@/store'

const isPicking = ref(false)
const mouse$ = ref<Subscription | null>(null)

const paletteRef = useTemplateRef('paletteRef')

const colorPickerStore = useColorPickerStore()

onMounted(() => {
  const canvas = paletteRef.value

  if (canvas) {
    colorPickerStore.setPalette(canvas)
    initPalette(canvas)
    initCanvasListener(canvas)
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

const initCanvasListener = (canvas: HTMLCanvasElement) => {
  mouse$.value = merge(
    fromEvent<MouseEvent>(canvas, 'mousedown').pipe(
      tap((event) => {
        isPicking.value = true
        colorPickerStore.setRGB(calculateRGB(event, canvas))
      })
    ),
    fromEvent<MouseEvent>(canvas, 'mousemove').pipe(
      tap((event) => {
        if (!isPicking.value) return
        colorPickerStore.setRGB(calculateRGB(event, canvas))
      })
    ),
    fromEvent<MouseEvent>(canvas, 'mouseup').pipe(
      tap(() => isPicking.value = false)
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