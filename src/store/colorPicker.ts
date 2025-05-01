import {
	DEFAULT_COLOR_PALETTE,
	DEFAULT_LAST_PICKED_COLOR,
	STORAGE_KEY_FOR_COLOR_PALETTE,
	STORAGE_KEY_FOR_LAST_PICKED_COLOR,
} from "@/constants";
import type { HSL, PickedPalette, Position, RGBA } from "@/types";
import { generateTintAndShade, makeRGBA, rgbToHsl } from "@/utils";
import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";

const INIT_RGB = { r: 255, g: 0, b: 0 };

export const useColorPickerStore = defineStore("colorPicker", () => {
	const pickedPalette = ref<PickedPalette>({});
	const palette = ref<HTMLCanvasElement | null>(null);
	const rgb = ref<RGBA>(INIT_RGB);
	const hsl = ref<HSL>(rgbToHsl(INIT_RGB));
	const alpha = ref(1);
	const pickedColor = ref<string>("");
	const mousePosOnHSLPalette = ref({ x: 187, y: 0 });

	const storage = useLocalStorage(
		STORAGE_KEY_FOR_COLOR_PALETTE,
		DEFAULT_COLOR_PALETTE as PickedPalette,
	);

	const storageForLPC = useLocalStorage(
		STORAGE_KEY_FOR_LAST_PICKED_COLOR,
		DEFAULT_LAST_PICKED_COLOR,
	);

	watch([() => rgb.value, () => alpha.value], ([rgb, alpha]) => {
		setPickedColor(`${makeRGBA({ ...rgb, a: alpha })}`);
	});

	const tintAndShade = computed(() => {
		const { tint, shade } = generateTintAndShade(hsl.value);
		return {
			tint: makeRGBA({ ...tint, a: alpha.value }),
			shade: makeRGBA({ ...shade, a: alpha.value }),
		};
	});

	const pickedColorHex = computed(() => {
		const { r, g, b } = rgb.value;
		const _alpha = Math.round(alpha.value * 255);
		const toHex = (n: number) => n.toString(16).padStart(2, "0");
		const withoutAlpha = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

		return `${withoutAlpha}${toHex(_alpha)}`;
	});

	const setPalette = (canvas: HTMLCanvasElement) => {
		palette.value = canvas;
	};

	const setRGB = (val: RGBA) => {
		rgb.value = val;
	};

	const setHSL = (val: HSL) => {
		hsl.value = val;
		storageForLPC.value.hsl = val;
	};

	const setAlpha = (val: number) => {
		alpha.value = val;
		storageForLPC.value.alpha = val;
	};

	const setPickedColor = (value: string) => {
		pickedColor.value = value;
		storageForLPC.value.pickedColor = value;
	};

	const setPickedPalette = (val: PickedPalette) => {
		pickedPalette.value = val;
	};

	const updatePickedPalette = (val: string, type: "add" | "delete" = "add") => {
		if (type === "delete") {
			delete pickedPalette.value[val];
		} else if (!pickedPalette.value[val]) {
			const { tint, shade } = generateTintAndShade(hsl.value);

			pickedPalette.value[val] = {
				pos: mousePosOnHSLPalette.value,
				tint: makeRGBA({ ...tint, a: alpha.value }),
				shade: makeRGBA({ ...shade, a: alpha.value }),
			};
		}

		storage.value = pickedPalette.value;
	};

	const setMousePosOnHSLPalette = (position: Position) => {
		mousePosOnHSLPalette.value = position;
		storageForLPC.value.hslPalettePos = position;
	};

	return {
		tintAndShade,
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
		updatePickedPalette,
		mousePosOnHSLPalette,
		setMousePosOnHSLPalette,
	};
});
