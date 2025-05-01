<script setup lang="ts">
import { PixelBorderSecondary } from "@/components";
import {
	DEFAULT_COLOR_PALETTE,
	STORAGE_KEY_FOR_COLOR_PALETTE,
} from "@/constants";
import { useColorPickerStore } from "@/store";
import type { PickedPalette, Position } from "@/types";
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

const storage = useLocalStorage(
	STORAGE_KEY_FOR_COLOR_PALETTE,
	DEFAULT_COLOR_PALETTE,
);

onMounted(() => {
	colorPickerStore.setPickedPalette(storage.value);
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
  <PixelBorderSecondary
    wrapper-height="!h-[calc(100%-40px)]"
    content-cls='flex flex-wrap content-start overflow-auto'
  >
    <PixelBorderTertiary
      class='relative cursor-pointer mr-[3px] mb-[3px] !w-8 !h-8'
      v-for='color of Object.keys(pickedPalette)'
      :key='color'
      :color='color'
      :tint="getTintOrShade(color, 'tint')"
      :shade="getTintOrShade(color, 'shade')"
      @click="() => onPicked(color, pickedPalette[color].pos)"
    >
      <div class="
        absolute
        w-[calc(100%+12px)]
        h-[calc(100%+12px)]
        top-[-6px]
        left-[-6px]
        bg-[url(@/assets/alpha-background.png)]
        bg-cover z-[-2]
        pointer-events-none"
      />
      <div
        class="h-full"
        :key="color"
        :style="{ background: color }"
      >
      </div>
    </PixelBorderTertiary>
  </PixelBorderSecondary>
</template>