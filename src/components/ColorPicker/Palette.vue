<script lang="ts" setup>
import { onMounted, useTemplateRef, ref, onBeforeUnmount } from 'vue'
import { fromEvent, Subscription, tap } from 'rxjs'
import { calculateRGB, hslToRgb, drawHSLPalette } from '@/utils'
import { useColorPickerStore } from '@/store'

const mouseUp$ = ref<Subscription | null>(null)

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

onBeforeUnmount(() => mouseUp$.value?.unsubscribe())

const initPalette = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')

  if (ctx) {
    colorPickerStore.setRGB(hslToRgb({ h: 0, s: 100, l: 50 }))
    drawHSLPalette(ctx, 0)
  }
}

const initCanvasListener = (canvas: HTMLCanvasElement) => {
  mouseUp$.value = fromEvent<MouseEvent>(canvas, 'mouseup').pipe(
    tap((event) => {
      colorPickerStore.setRGB(calculateRGB(event, canvas))
    })
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