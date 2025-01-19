<script setup lang="ts">
import Alpha from "./Alpha.vue";
import HSLPalette from "./HSLPalette.vue";
import Hue from "./Hue.vue";
import Preview from "./Preview.vue";
</script>
<template>
  <div class="color-picker">
    <HSLPalette />
    <Hue />
    <Alpha />
    <Preview />
  </div>
</template>
<style lang="scss" scoped>
.color-picker {
  width: 200px;
}
</style>