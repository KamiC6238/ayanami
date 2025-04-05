<script setup lang="ts">
import { useColorPickerStore } from "@/store";
import { calculateHue, drawHSLPalette, getMouse$, hslToRgb } from "@/utils";
import { storeToRefs } from "pinia";
import type { Subscription } from "rxjs";
import {
	type CSSProperties,
	computed,
	onBeforeUnmount,
	onMounted,
	ref,
	useTemplateRef,
} from "vue";

const isDragging = ref(false);
const mouse$ = ref<Subscription | null>(null);

const hueRef = useTemplateRef("hue");

const colorPickerStore = useColorPickerStore();
const { palette, hsl, previewColor } = storeToRefs(colorPickerStore);

onMounted(() => initMouse$());

onBeforeUnmount(() => mouse$.value?.unsubscribe());

const hueIndicatorStyle = computed<CSSProperties>(() => ({
	left: `${Math.round((hsl.value.h / 360) * 100)}%`,
	background: previewColor.value,
}));

const initMouse$ = () => {
	if (!hueRef.value) return;

	const mousedown = (e: MouseEvent) => {
		isDragging.value = true;
		setHue(e);
	};

	const mousemove = (e: MouseEvent) => {
		if (!isDragging.value) return;
		setHue(e);
	};

	mouse$.value = getMouse$({
		hueRef: {
			el: hueRef.value as HTMLDivElement,
			mousedown,
			mousemove,
			mouseup: (e) => setHue(e),
		},
		doc: {
			el: document,
			mousemove,
			mouseup: () => {
				isDragging.value = false;
			},
		},
	}).subscribe();
};

const setHue = (e: MouseEvent) => {
	if (hueRef.value) {
		const ctx = palette.value?.getContext("2d");

		if (ctx) {
			const hue = calculateHue(e, hueRef.value as HTMLDivElement);
			const newHSL = { ...hsl.value, h: hue };
			colorPickerStore.setHSL(newHSL);
			colorPickerStore.setRGB(hslToRgb(newHSL));
			drawHSLPalette(ctx, hue);
		}
	}
};
</script>
<template>
  <div class="hue relative w-full min-h-[15px] cursor-pointer" ref="hue">
    <div
      class="hue__indicator absolute w-[5px] h-[5px] border-1 border-solid border-white rounded-full cursor-pointer"
      :style="hueIndicatorStyle"
    />
  </div>
</template>
<style scoped>
.hue {
  background: linear-gradient(
    to right,
    hsl(0,100%,50%),
    hsl(60,100%,50%),
    hsl(120,100%,50%),
    hsl(180,100%,50%),
    hsl(240,100%,50%),
    hsl(300,100%,50%),
    hsl(360,100%,50%)
  );
}
.hue__indicator {
  top: 50%;
  transform: translate(-53%, -50%);
}
</style>