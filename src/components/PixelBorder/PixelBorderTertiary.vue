<script setup lang="ts">
import PixelBorderPrimary from "./PixelBorderPrimary.vue";

interface Props {
	borderWidth?: number;
	borderLeftTopColor?: string;
	borderRightBottomColor?: string;
}

defineProps<Props>();
</script>
<template>
  <PixelBorderPrimary>
    <div
      class='relative left-[3px] top-[3px] w-[calc(100%-6px)] h-[calc(100%-6px)]'
      :style="{
        borderLeftColor: borderLeftTopColor,
        borderTopColor: borderLeftTopColor,
        borderRightColor: borderRightBottomColor,
        borderBottomColor: borderRightBottomColor,
        borderWidth: `${borderWidth ?? 3}px`,
        borderStyle: 'solid',
      }">
      <slot />
    </div>
  </PixelBorderPrimary>
</template>