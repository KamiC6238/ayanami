<script setup lang="ts">
import type { Frame } from "@/types";
import { PixelBorderSecondary } from "../PixelBorder";

defineProps<Frame>();
</script>
<template>
  <PixelBorderSecondary
    wrapper-width="w-50"
    wrapper-height="h-50"
  >
    <img :src="snapshot" />
  </PixelBorderSecondary>
</template>