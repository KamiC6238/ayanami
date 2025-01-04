<script setup lang="ts">
import { onMounted, useTemplateRef, ref, onBeforeUnmount } from 'vue'
import { Subscription } from 'rxjs'
import { calculateRGB, hslToRgb, drawHSLPalette, getMouse$ } from '@/utils'
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
  const mousedown = (e: MouseEvent) => {
    isDragging.value = true
    colorPickerStore.setRGB(calculateRGB(e, canvas))
  }

  const mousemove = (e: MouseEvent) => {
    if (!isDragging.value) return
    colorPickerStore.setRGB(calculateRGB(e, canvas))
  }

  mouse$.value = getMouse$({
    palette: {
      el: canvas,
      mousedown,
      mousemove,
      mouseup: (e) => colorPickerStore.setRGB(calculateRGB(e, canvas))
    },
    doc: {
      el: document,
      mousemove,
      mouseup: () => isDragging.value = false
    }
  }).subscribe()
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