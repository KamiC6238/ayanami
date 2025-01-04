<script setup lang="ts">
import { ref, onMounted, useTemplateRef, onBeforeUnmount } from 'vue';
import { Subscription } from 'rxjs'
import { storeToRefs } from 'pinia';
import { useColorPickerStore } from '@/store';
import { getMouse$, calculateAlpha } from '@/utils';

const isDragging = ref(false)
const mouse$ = ref<Subscription | null>(null)

const alphaRef = useTemplateRef('alpha')

const colorPickerStore = useColorPickerStore()
const { rgb } = storeToRefs(colorPickerStore)

onMounted(() => initMouse$())

onBeforeUnmount(() => mouse$.value?.unsubscribe())

const initMouse$ = () => {
  if (!alphaRef.value) return

  const mousedown = (e: MouseEvent) => {
    isDragging.value = true
    setAlpha(e)
  }

  const mousemove = (e: MouseEvent) => {
    if (!isDragging.value) return
    setAlpha(e)
  }

  mouse$.value = getMouse$({
    alphaRef: {
      el: alphaRef.value,
      mousedown,
      mousemove,
      mouseup: e => setAlpha(e)
    },
    doc: {
      el: document,
      mousemove,
      mouseup: () => isDragging.value = false
    }
  }).subscribe()
}

const setAlpha = (e: MouseEvent) => {
  if (alphaRef.value) {
    const alpha = calculateAlpha(e, alphaRef.value)
    colorPickerStore.setAlpha(alpha)
  }
}
</script>
<template>
  <div class="alpha-container">
    <div class="alpha-background"></div>
    <div
      class="alpha-gradient"
      ref="alpha"
      :style="{
        background: `linear-gradient(90deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0), rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1))`
      }"
    >
    </div>
  </div>
</template>
<style scoped>
.alpha-container {
  position: relative;
  width: 100px;
  margin-top: 5px;
  margin-bottom: 5px;
}
.alpha-gradient {
  border: 2px solid black;
  box-sizing: border-box;
  height: 20px;
}
.alpha-background {
  position: absolute;
  width: 100%;
  height: 20px;
  background-image: url('@/assets/alpha-background.svg');
  z-index: -1;
}
</style>