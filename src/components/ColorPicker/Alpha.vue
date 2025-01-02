<script setup lang="ts">
import { ref, onMounted, useTemplateRef, onBeforeUnmount } from 'vue';
import { fromEvent, merge, Subscription, tap, throttleTime } from 'rxjs'
import { useColorPickerStore } from '@/store';
import { storeToRefs } from 'pinia';

const isDragging = ref(false)
const mouse$ = ref<Subscription | null>(null)

const alphaRef = useTemplateRef('alpha')

const colorPickerStore = useColorPickerStore()
const { rgb } = storeToRefs(colorPickerStore)

/**
 * TODO
 * 1. palette, hue, alpha 增加选中的位置样式
 */

onMounted(() => initMouse$())

onBeforeUnmount(() => mouse$.value?.unsubscribe())

const initMouse$ = () => {
  if (!alphaRef.value) return

  mouse$.value = merge(
    fromEvent<MouseEvent>(alphaRef.value, 'mousedown').pipe(
      tap((e) => {
        isDragging.value = true
        setAlpha(e)
      })
    ),
    fromEvent<MouseEvent>(alphaRef.value, 'mousemove').pipe(
      throttleTime(16),
      tap((e) => {
        if (!isDragging.value) return
        setAlpha(e)
      })
    ),
    fromEvent<MouseEvent>(alphaRef.value, 'mouseup').pipe(
      tap((e) => {
        isDragging.value = false
        setAlpha(e)
      })
    ),
  ).subscribe()
}

const setAlpha = (e: MouseEvent) => {
  if (alphaRef.value) {
    const rect = alphaRef.value.getBoundingClientRect()
    const curAlpha = Math.round((e.clientX - rect.left) / rect.width * 100)

    colorPickerStore.setAlpha(
      Number((curAlpha / 100).toFixed(2))
    )
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
  height: 100%;
  background-image: url('@/assets/alpha-background.svg');
  z-index: -1;
}
</style>