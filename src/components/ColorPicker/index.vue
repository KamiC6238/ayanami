<script setup lang="ts">
import Hue from './Hue.vue'
import Palette from './Palette.vue';
</script>
<template>
  <div class="color-picker">
    <Palette />
    <Hue />
  </div>
</template>
<style scoped>
.color-picker {}
</style>