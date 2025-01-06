<script setup lang="ts">
import Alpha from "./Alpha.vue";
import Hue from "./Hue.vue";
import Palette from "./Palette.vue";
import Preview from "./Preview.vue";
</script>
<template>
  <div class="color-picker">
    <Palette />
    <Hue />
    <Alpha />
    <Preview />
  </div>
</template>
<style scoped>
.color-picker {
  width: 190px;
}
</style>