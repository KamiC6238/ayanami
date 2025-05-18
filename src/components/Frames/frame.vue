<script setup lang="ts">
import type { Frame } from "@/types";
import { PixelBorderSecondary } from "../PixelBorder";

defineProps<Frame>();
</script>
<template>
  <PixelBorderSecondary
    wrapper-width="w-25"
    wrapper-height="h-25"
  >
    <img :src="snapshot" />
  </PixelBorderSecondary>
</template>