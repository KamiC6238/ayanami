<script setup lang="ts">
import Palette from './Palette.vue';
import Hue from './Hue.vue'
import Alpha from './Alpha.vue';
import Preview from './Preview.vue';
</script>
<template>
  <div class="color-picker">
    <Palette />
    <Hue />
    <Alpha />
    <Preview />
  </div>
</template>
<style scoped></style>