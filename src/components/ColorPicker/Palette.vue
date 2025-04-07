<script setup lang="ts">
import { PixelBorderSecondary } from "@/components";
import { STORAGE_KEY_FOR_COLOR_PALETTE } from "@/constants";
import { useColorPickerStore } from "@/store";
import type { Position } from "@/types";
import { drawHSLPalette, rgbToHsl } from "@/utils";
import { useLocalStorage } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import PixelBorderTertiary from "../PixelBorder/PixelBorderTertiary.vue";

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
    <PixelBorderTertiary
      class='relative mr-[3px] mb-[3px] !w-8 !h-8'
      v-for='pickedColor of Object.keys(pickedPalette)'
      :key='pickedColor'
      :border-left-top-color='pickedPalette[pickedColor].tint'
      :border-right-bottom-color='pickedPalette[pickedColor].shade'
    >
      <div class="absolute w-[31px] h-[31px] left-[-5.5px] top-[-5.5px] bg-[url(@/assets/alpha-background.png)] bg-cover z-[-2] pointer-events-none" />
      <div
        class="relative w-[20.4px] h-[20.4px] border-solid border-black cursor-pointer"
        :key="pickedColor"
        :style="{ background: pickedColor }"
        @click="() => onPicked(pickedColor, pickedPalette[pickedColor].pos)"
      >
      </div>
    </PixelBorderTertiary>
  </PixelBorderSecondary>
</template>