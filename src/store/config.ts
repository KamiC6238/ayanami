import { DEFAULT_PIXEL_COLOR, DEFAULT_PIXEL_SIZE } from "@/constants";
import { ToolTypeEnum } from "@/types";
import { defineStore, storeToRefs } from "pinia";
import { ref, watch } from "vue";
import { useColorPickerStore } from "./colorPicker";

export const useConfigStore = defineStore("config", () => {
	const toolType = ref<ToolTypeEnum>(ToolTypeEnum.Unknown);
	const pixelSize = ref(DEFAULT_PIXEL_SIZE);
	const pixelColor = ref(DEFAULT_PIXEL_COLOR);

	const colorPickerStore = useColorPickerStore();
	const { pickedColorHex } = storeToRefs(colorPickerStore);

	watch(pickedColorHex, (val) => {
		setPixelColor(val);
	});

	const setToolType = (_toolType: ToolTypeEnum) => {
		toolType.value = _toolType;
	};

	const setPixelSize = (size: number) => {
		pixelSize.value = size;
	};

	const setPixelColor = (color: string) => {
		pixelColor.value = color;
	};

	return {
		toolType,
		setToolType,
		pixelSize,
		setPixelSize,
		pixelColor,
		setPixelColor,
	};
});
