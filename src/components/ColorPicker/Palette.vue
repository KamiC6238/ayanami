<script setup lang="ts">
import { PixelBorderPrimary, PixelBorderSecondary } from "@/components";
import { STORAGE_KEY_FOR_COLOR_PALETTE } from "@/constants";
import { useColorPickerStore } from "@/store";
import type { Position } from "@/types";
import { drawHSLPalette, rgbToHsl } from "@/utils";
import { useLocalStorage } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";

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
</script>
<template>
  <PixelBorderSecondary content-cls='flex flex-wrap content-start'>
    <PixelBorderPrimary
      class='relative mr-[3px] mb-[3px]'
      v-for='pickedColor of Object.keys(pickedPalette)'
      :key='pickedColor'
    >
      <div class="absolute inset-0 bg-[url(@/assets/alpha-background.png)] bg-cover z-0 pointer-events-none" />
      <div
        class="relative w-7.5 h-7.5 border-1 border-solid border-black cursor-pointer"
        :key="pickedColor"
        :style="{ background: pickedColor }"
        @click="() => onPicked(pickedColor, pickedPalette[pickedColor])"
      >
      </div>
    </PixelBorderPrimary>
  </PixelBorderSecondary>
</template>