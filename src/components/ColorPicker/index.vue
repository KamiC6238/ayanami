<script setup lang="ts">
import Alpha from "./Alpha.vue";
import HSLPalette from "./HSLPalette.vue";
import Hue from "./Hue.vue";
</script>
<template>
  <div class="w-full h-full flex flex-col ">
    <HSLPalette class='flex-1' />
    <Hue />
    <Alpha />
  </div>
</template>