<script setup lang="ts">
import Alpha from "./Alpha.vue";
import HSLPalette from "./HSLPalette.vue";
import Hue from "./Hue.vue";
import Preview from "./Preview.vue";
</script>
<template>
  <div class="w-full h-full flex flex-col">
    <HSLPalette />
    <Hue />
    <Alpha />
    <Preview />
  </div>
</template>