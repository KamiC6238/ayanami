import type { HSL, RGBA } from "@/types";
import { makeRGBA, rgbToHsl } from "@/utils";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

const INIT_RGB = { r: 255, g: 0, b: 0 };

export const useColorPickerStore = defineStore("colorPicker", () => {
	const pickedPalette = ref<Map<string, boolean>>(new Map());
	const palette = ref<HTMLCanvasElement | null>(null);
	const rgb = ref<RGBA>(INIT_RGB);
	const hsl = ref<HSL>(rgbToHsl(INIT_RGB));
	const alpha = ref(1);

	const pickedColor = computed(() => {
		return `${makeRGBA({ ...rgb.value, a: alpha.value })}`;
	});

	const pickedColorHex = computed(() => {
		const { r, g, b } = rgb.value;
		const _alpha = Math.round(alpha.value * 255);
		const toHex = (n: number) => n.toString(16).padStart(2, "0");
		const withoutAlpha = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

		return _alpha === 255 ? withoutAlpha : `${withoutAlpha}${toHex(_alpha)}`;
	});

	const setPalette = (canvas: HTMLCanvasElement) => {
		palette.value = canvas;
	};

	const setRGB = (val: RGBA) => {
		rgb.value = val;
	};

	const setHSL = (val: HSL) => {
		hsl.value = val;
	};

	const setAlpha = (val: number) => {
		alpha.value = val;
	};

	const setPickedPalette = (val: string) => {
		if (!pickedPalette.value.has(val)) {
			pickedPalette.value.set(val, true);
		}
	};

	return {
		pickedColor,
		pickedColorHex,
		palette,
		setPalette,
		alpha,
		setAlpha,
		rgb,
		setRGB,
		hsl,
		setHSL,
		pickedPalette,
		setPickedPalette,
	};
});
