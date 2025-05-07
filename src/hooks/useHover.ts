import { DEFAULT_PIXEL_SIZE } from "@/constants";
import { useCanvasStore } from "@/store";
import type { Position } from "@/types";
import { isPixelPositionChanged } from "@/utils";
import { ref } from "vue";
import { useToolsCommon } from "./useToolsCommon";

export function useHoverPixel() {
	const hoveredPixel = ref<Position | null>(null);

	const canvasStore = useCanvasStore();
	const { getMousePosition } = useToolsCommon();

	const drawHoverPixel = (event: MouseEvent) => {
		const position = getMousePosition(event, DEFAULT_PIXEL_SIZE);
		if (!position) return;

		clearPreHoveredPixel(position);
		setHoveredPixel(position);
	};

	const clearPreHoveredPixel = (position: Position) => {
		if (
			!hoveredPixel.value ||
			!isPixelPositionChanged(position, hoveredPixel.value)
		) {
			return;
		}

		setHoveredPixel(null);
	};

	const setHoveredPixel = (position: Position | null) => {
		if (position) {
			if (
				hoveredPixel.value &&
				!isPixelPositionChanged(position, hoveredPixel.value)
			) {
				return;
			}

			hoveredPixel.value = position;
			canvasStore.fillHoverRect(position);
			return;
		}

		if (!position && hoveredPixel.value) {
			canvasStore.clearHoverRect({ ...hoveredPixel.value });
			hoveredPixel.value = null;
		}
	};

	return {
		drawHoverPixel,
		setHoveredPixel,
	};
}
