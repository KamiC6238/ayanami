<script setup lang="ts">
import { PixelBorderSecondary } from "@/components";
import { STORAGE_KEY_FOR_LAST_PICKED_COLOR } from "@/constants";
import { useColorPickerStore } from "@/store";
import { drawHSLPalette } from "@/utils";
import { useLocalStorage } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import Alpha from "./Alpha.vue";
import HSLPalette from "./HSLPalette.vue";
import Hue from "./Hue.vue";
import Preview from "./Preview.vue";

const storage = useLocalStorage(STORAGE_KEY_FOR_LAST_PICKED_COLOR, "{}");
const colorpickerStore = useColorPickerStore();
const { palette } = storeToRefs(colorpickerStore);

onMounted(() => {
	if (!storage.value) return;

	const ctx = palette.value?.getContext("2d");
	const { hsl, alpha, pickedColor, hslPalettePos } = JSON.parse(storage.value);
	colorpickerStore.setHSL(hsl);
	colorpickerStore.setAlpha(alpha);
	colorpickerStore.setPickedColor(pickedColor);
	colorpickerStore.setMousePosOnHSLPalette(hslPalettePos);
	ctx && drawHSLPalette(ctx, hsl.h);
});
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