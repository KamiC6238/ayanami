<script setup lang="ts">
import { PixelBorderSecondary } from "@/components";
import { STORAGE_KEY_FOR_COLOR_PALETTE } from "@/constants";
import { useColorPickerStore } from "@/store";
import type { Position } from "@/types";
import { drawHSLPalette, rgbToHsl } from "@/utils";
import { useLocalStorage } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import PixelBorderTertiary from "../PixelBorder/PixelBorderTertiary.vue";

const hoveredColor = ref("");

const colorPickerStore = useColorPickerStore();
const {
	pickedPalette,
	palette,
	pickedColor: currentPickedColor,
} = storeToRefs(colorPickerStore);

const storage = useLocalStorage(STORAGE_KEY_FOR_COLOR_PALETTE, "{}");

onMounted(() => {
	colorPickerStore.setPickedPalette(JSON.parse(storage.value));
});

const onPicked = (pickedColor: string, position: Position) => {
	if (pickedColor === currentPickedColor.value) {
		return;
	}

	const [r, g, b, a] = pickedColor.match(/[\d.]+/g)?.map(Number) ?? [];
	const rgba = { r, g, b, a };
	const hsl = rgbToHsl(rgba);
	const ctx = palette.value?.getContext("2d");

	colorPickerStore.setAlpha(a);
	colorPickerStore.setRGB(rgba);
	colorPickerStore.setHSL(rgbToHsl(rgba));
	colorPickerStore.setMousePosOnHSLPalette(position);
	colorPickerStore.setPickedColor(pickedColor);
	ctx && drawHSLPalette(ctx, hsl.h);
};

const getTintOrShade = (color: string, type: "tint" | "shade") => {
	return pickedPalette.value[color][type];
};
</script>
<template>
  <PixelBorderSecondary content-cls='flex flex-wrap content-start'>
    <PixelBorderTertiary
      class='relative mr-[3px] mb-[3px] !w-8 !h-8'
      v-for='color of Object.keys(pickedPalette)'
      :key='color'
      :border-left-top-color="hoveredColor === color
        ? getTintOrShade(color, 'shade')
        : getTintOrShade(color, 'tint')"
      :border-right-bottom-color="hoveredColor === color
        ? getTintOrShade(color, 'tint')
        : getTintOrShade(color, 'shade')"
      @mouseover='hoveredColor = color'
      @mouseleave='hoveredColor = ""'
    >
      <div class="absolute w-full h-full bg-[url(@/assets/alpha-background.png)] bg-cover z-[-2] pointer-events-none" />
      <div
        class="cursor-pointer h-full"
        :key="color"
        :style="{ background: color }"
        @click="() => onPicked(color, pickedPalette[color].pos)"
      >
      </div>
    </PixelBorderTertiary>
  </PixelBorderSecondary>
</template>