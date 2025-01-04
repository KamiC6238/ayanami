<script setup lang="ts">
import { ref, onMounted, useTemplateRef, onBeforeUnmount } from 'vue'
import { Subscription } from 'rxjs'
import { storeToRefs } from 'pinia';
import { drawHSLPalette, hslToRgb, getMouse$, calculateHue } from '@/utils';
import { useColorPickerStore } from '@/store';

const isDragging = ref(false)
const mouse$ = ref<Subscription | null>(null)

const hueRef = useTemplateRef('hue')

const colorPickerStore = useColorPickerStore()
const { palette, hsl } = storeToRefs(colorPickerStore)

onMounted(() => initMouse$())

onBeforeUnmount(() => mouse$.value?.unsubscribe())

const initMouse$ = () => {
  if (!hueRef.value) return

  const mousedown = (e: MouseEvent) => {
    isDragging.value = true
    setHue(e)
  }

  const mousemove = (e: MouseEvent) => {
    if (!isDragging.value) return
    setHue(e)
  }

  mouse$.value = getMouse$({
    hueRef: {
      el: hueRef.value,
      mousedown,
      mousemove,
      mouseup: e => setHue(e)
    },
    doc: {
      el: document,
      mousemove,
      mouseup: () => isDragging.value = false
    }
  }).subscribe()
}

const setHue = (e: MouseEvent) => {
  if (hueRef.value) {
    const ctx = palette.value?.getContext('2d')

    if (ctx) {
      const hue = calculateHue(e, hueRef.value)

      colorPickerStore.setRGB(hslToRgb({ ...hsl.value, h: hue }))
      drawHSLPalette(ctx, hue)
    } 
  }
}
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