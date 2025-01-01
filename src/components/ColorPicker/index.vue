<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { makeRGB } from '@/utils';
import { useColorPickerStore } from '@/store';
import Palette from './Palette.vue';
import Hue from './Hue.vue'
import Alpha from './Alpha.vue';

const colorPickerStore = useColorPickerStore()
const { rgb } = storeToRefs(colorPickerStore)
</script>
<template>
  <div class="color-picker">
    <Palette />
    <Hue />
    <Alpha />
    <div
      class="preview"
      :style="{ background: makeRGB(rgb) }"
    />
  </div>
</template>
<style scoped>
.preview {
  width: 100px;
  height: 20px;
  border: 2px solid black;
  box-sizing: border-box;
  background-image: url('@/assets/alpha-background.svg');
}
</style>