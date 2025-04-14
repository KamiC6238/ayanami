import { useCanvasStore, useColorPickerStore, useConfigStore } from "@/store";
import {
	type RecordCommonConfig,
	type RecordConfig,
	ToolTypeEnum,
} from "@/types";
import { storeToRefs } from "pinia";
import { computed } from "vue";

export function useRecord() {
	const configStore = useConfigStore();
	const canvasStore = useCanvasStore();
	const colorPickerStore = useColorPickerStore();

	const { pixelColor, pixelSize, toolType } = storeToRefs(configStore);
	const { pickedColorHex } = storeToRefs(colorPickerStore);

	const commonRecordConfig = computed<RecordCommonConfig>(() => ({
		type: toolType.value,
		color: pickedColorHex.value,
		size: pixelSize.value,
	}));

	const record = (toolType: ToolTypeEnum, config: RecordConfig) => {
		switch (toolType) {
			case ToolTypeEnum.Pencil:
				break;
			case ToolTypeEnum.Eraser:
				break;
			case ToolTypeEnum.Line:
				break;
			case ToolTypeEnum.Square:
				break;
			case ToolTypeEnum.Circle:
				break;
		}
	};

	return {
		record,
	};
}
