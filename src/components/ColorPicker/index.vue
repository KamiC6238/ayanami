<script setup lang="ts">
import { PixelBorder } from "@/components";
import Alpha from "./Alpha.vue";
import HSLPalette from "./HSLPalette.vue";
import Hue from "./Hue.vue";
import Preview from "./Preview.vue";
</script>
<template>
  <div class='w-full h-full flex flex-col'>
    <PixelBorder class="!w-full !h-full flex flex-col">
      <HSLPalette class='w-full' />
      <Hue />
      <Alpha />
    </PixelBorder>
    <Preview />
  </div>
</template>