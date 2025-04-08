<script setup lang="ts">
import { computed, ref } from "vue";
import PixelBorderPrimary from "./PixelBorderPrimary.vue";

interface Props {
	color: string;
	tint: string;
	shade: string;
	borderWidth?: number;
	dontReverse?: boolean;
}

const props = defineProps<Props>();

const hoveredColor = ref("");

const hovered = computed(() =>
	props.dontReverse ? false : hoveredColor.value === props.color,
);
</script>
<template>
  <PixelBorderPrimary>
    <div
      class="relative w-[calc(100%-6px)] h-[calc(100%-6px)] left-[3px] top-[3px]"
      :style="{
        borderLeftColor: hovered ? shade : tint,
        borderTopColor: hovered ? shade : tint,
        borderRightColor: hovered ? tint : shade,
        borderBottomColor: hovered ? tint : shade,
        borderWidth: `${borderWidth ?? 3}px`,
        borderStyle: 'solid',
      }"
      @mouseover='hoveredColor = color'
      @mouseleave='hoveredColor = ""'
    >
      <slot />
    </div>
  </PixelBorderPrimary>
</template>