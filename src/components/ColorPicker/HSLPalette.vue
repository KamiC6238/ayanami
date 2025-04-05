<script setup lang="ts">
import { useColorPickerStore } from "@/store";
import {
	calculateMousePosition,
	calculateRGB,
	drawHSLPalette,
	getMouse$,
	hslToRgb,
	rgbToHsl,
} from "@/utils";
import { storeToRefs } from "pinia";
import type { Subscription } from "rxjs";
import {
	type CSSProperties,
	computed,
	onBeforeUnmount,
	onMounted,
	ref,
	useTemplateRef,
	watch,
} from "vue";

const isDragging = ref(false);
const mouse$ = ref<Subscription | null>(null);

const paletteRef = useTemplateRef("paletteRef");

const colorPickerStore = useColorPickerStore();
const { hsl, pickedColor, mousePosOnHSLPalette } =
	storeToRefs(colorPickerStore);

onMounted(() => {
	const canvas = paletteRef.value as HTMLCanvasElement;

	if (canvas) {
		colorPickerStore.setPalette(canvas);
		initPalette(canvas);
		initMouse$(canvas);
	}
});

onBeforeUnmount(() => mouse$.value?.unsubscribe());

watch(
	() => hsl.value,
	(val) => {
		colorPickerStore.setRGB(hslToRgb(val));
	},
);

const paletteIndicatorStyle = computed<CSSProperties>(() => {
	if (paletteRef.value) {
		const { width, height } = (
			paletteRef.value as HTMLCanvasElement
		).getBoundingClientRect();

		return {
			left: `${(Math.round(mousePosOnHSLPalette.value.x) / width) * 100}%`,
			top: `${(Math.round(mousePosOnHSLPalette.value.y) / height) * 100}%`,
			background: pickedColor.value,
		};
	}
	return {};
});

const initPalette = (canvas: HTMLCanvasElement) => {
	const ctx = canvas.getContext("2d");

	if (ctx) {
		colorPickerStore.setRGB(hslToRgb({ h: 0, s: 100, l: 50 }));
		drawHSLPalette(ctx, 0);
	}
};

const initMouse$ = (canvas: HTMLCanvasElement) => {
	const update = (e: MouseEvent) => {
		const rgb = calculateRGB(e, canvas);

		if (rgb) {
			colorPickerStore.setRGB(rgb);
			colorPickerStore.setHSL({
				...rgbToHsl(rgb),
				h: hsl.value.h,
			});
		}
		colorPickerStore.setMousePosOnHSLPalette(calculateMousePosition(e, canvas));
	};

	const mousedown = (e: MouseEvent) => {
		isDragging.value = true;
		update(e);
	};

	const mousemove = (e: MouseEvent) => {
		if (!isDragging.value) return;
		update(e);
	};

	mouse$.value = getMouse$({
		palette: {
			el: canvas,
			mousedown,
			mousemove,
			mouseup: (e) => update(e),
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
</script>
<template>
  <div class="relative flex-1">
    <canvas class="absolute flex flex-col w-full h-full cursor-pointer" ref="paletteRef"></canvas>
    <div
      class="absolute w-[10px] h-[10px] rounded-full cursor-pointer z-1 border-2 border-white border-solid -translate-x-[53%] -translate-y-[50%]"
      :style="paletteIndicatorStyle"
    />
  </div>
</template>