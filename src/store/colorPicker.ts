import type { HSL, Position, RGBA } from "@/types";
import { makeRGBA, rgbToHsl } from "@/utils";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";

const INIT_RGB = { r: 255, g: 0, b: 0 };

export const useColorPickerStore = defineStore("colorPicker", () => {
	const pickedPalette = ref<Map<string, Position>>(new Map());
	const palette = ref<HTMLCanvasElement | null>(null);
	const rgb = ref<RGBA>(INIT_RGB);
	const hsl = ref<HSL>(rgbToHsl(INIT_RGB));
	const alpha = ref(1);
	const pickedColor = ref<string>("");
	const mousePosOnHSLPalette = ref({ x: 200, y: 0 });

	watch([() => rgb.value, () => alpha.value], ([rgb, alpha]) => {
		setPickedColor(`${makeRGBA({ ...rgb, a: alpha })}`);
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

	const setPickedColor = (value: string) => {
		pickedColor.value = value;
	};

	const setPickedPalette = (val: string) => {
		if (!pickedPalette.value.has(val)) {
			pickedPalette.value.set(val, mousePosOnHSLPalette.value);
		}
	};

	const setMousePosOnHSLPalette = (position: Position) => {
		mousePosOnHSLPalette.value = position;
	};

	return {
		pickedColor,
		setPickedColor,
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
		mousePosOnHSLPalette,
		setMousePosOnHSLPalette,
	};
});
