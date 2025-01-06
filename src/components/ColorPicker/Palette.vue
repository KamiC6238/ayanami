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

const mousePos = ref({ x: 100, y: 0 });
const isDragging = ref(false);
const mouse$ = ref<Subscription | null>(null);

const paletteRef = useTemplateRef("paletteRef");

const colorPickerStore = useColorPickerStore();
const { hsl } = storeToRefs(colorPickerStore);

onMounted(() => {
	const canvas = paletteRef.value;

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
		const { width, height } = paletteRef.value.getBoundingClientRect();

		return {
			left: `${(Math.round(mousePos.value.x) / width) * 100}%`,
			top: `${(Math.round(mousePos.value.y) / height) * 100}%`,
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
		mousePos.value = calculateMousePosition(e, canvas);
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
  <div class="palette-container">
    <canvas class="palette" ref="paletteRef"></canvas>
    <div class="palette-indicator" :style="paletteIndicatorStyle" />
  </div>
</template>
<style scoped>
.palette-container {
  position: relative;
}
.palette {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100px;
  cursor: pointer;
}
.palette-indicator {
  position: absolute;
  width: 5px;
  height: 5px;
  border: 2px solid black;
  border-radius: 100%;
  transform: translate(-53%, -50%);
  cursor: pointer;
  z-index: 1;
}
</style>