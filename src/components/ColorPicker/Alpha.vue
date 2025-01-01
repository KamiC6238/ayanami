<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue';
import { useColorPickerStore } from '@/store';
import { storeToRefs } from 'pinia';

const alphaRef = useTemplateRef('alpha')

const colorPickerStore = useColorPickerStore()
const { rgb } = storeToRefs(colorPickerStore)

onMounted(() => {
  const alpha = alphaRef.value

  if (alpha) {

  }
})
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