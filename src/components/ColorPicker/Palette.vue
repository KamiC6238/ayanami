<script setup lang="ts">
import { useColorPickerStore } from "@/store";
import type { Position } from "@/types";
import { drawHSLPalette, rgbToHsl } from "@/utils";
import { storeToRefs } from "pinia";

const colorPickerStore = useColorPickerStore();
const {
	pickedPalette,
	palette,
	pickedColor: currentPickedColor,
} = storeToRefs(colorPickerStore);

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
  <div class="bg-[#7d929e] w-full h-full">
    <div class='bg-[#635561] w-full h-full  flex flex-wrap content-start'>
      <div
        v-for='[pickedColor, position] of pickedPalette'
        class='w-7.5 h-7.5 border-1 border-solid border-black cursor-pointer'
        :key='pickedColor'
        :style='{ background: pickedColor }'
        @click='() => onPicked(pickedColor, position)'
      >
    </div>
    </div>
  </div>
</template>