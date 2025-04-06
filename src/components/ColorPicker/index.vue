<script setup lang="ts">
import { PixelBorderSecondary } from "@/components";
import Alpha from "./Alpha.vue";
import HSLPalette from "./HSLPalette.vue";
import Hue from "./Hue.vue";
import Preview from "./Preview.vue";
</script>
<template>
  <div class='w-full h-full flex flex-col'>
    <PixelBorderSecondary
      class="!w-full !h-full"
      content-cls='flex flex-col top-0 !left-[3px] !top-[3px] !w-[calc(100%-13px)] !h-[calc(100%-13px)]'
    >
      <HSLPalette class='w-full' />
      <Hue />
      <Alpha />
    </PixelBorderSecondary>
    <Preview />
  </div>
</template>