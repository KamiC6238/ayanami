import { DEFAULT_HOVERED_PIXEL_COLOR } from "@/constants";
import type {
	CanvasType,
	InitCanvasConfig,
	Position,
	RectConfig,
	SquareRectConfig,
} from "@/types";
import { drawGrid, scaleCanvasByDPR } from "@/utils";
import { defineStore } from "pinia";
import { type Observable, fromEvent } from "rxjs";
import { computed, ref } from "vue";
import { useConfigStore } from "./config";

export const useCanvasStore = defineStore("canvas", () => {
	const canvas = ref<HTMLCanvasElement | null>(null);
	const gridCanvas = ref<HTMLCanvasElement | null>(null);
	const previewCanvas = ref<HTMLCanvasElement | null>(null);

	const mouseDown$ = ref<Observable<MouseEvent>>();
	const mouseMove$ = ref<Observable<MouseEvent>>();
	const mouseUp$ = ref<Observable<MouseEvent>>();
	const mouseLeave$ = ref<Observable<MouseEvent>>();
	const globalMouseUp$ = ref<Observable<MouseEvent>>(
		fromEvent<MouseEvent>(document, "mouseup"),
	);

	const configStore = useConfigStore();

	const canvasMap = computed<Record<CanvasType, HTMLCanvasElement | null>>(
		() => ({
			main: canvas.value,
			grid: gridCanvas.value,
			preview: previewCanvas.value,
		}),
	);

	const getCanvas = (canvasType: CanvasType) => {
		return canvasMap.value[canvasType];
	};

	const getCanvasContext = (canvasType: CanvasType) => {
		return getCanvas(canvasType)?.getContext("2d");
	};

	const initCanvas = (_canvas: HTMLCanvasElement, config: InitCanvasConfig) => {
		switch (config.type) {
			case "main":
				canvas.value = _canvas;
				break;
			case "preview":
				previewCanvas.value = _canvas;
				initCanvasMouse$(_canvas);
				break;
			case "grid":
				gridCanvas.value = _canvas;
				break;
		}

		scaleCanvasByDPR(_canvas);

		if (config.type === "grid") {
			drawGrid(_canvas);
		}
	};

	const initCanvasMouse$ = (canvas: HTMLCanvasElement) => {
		mouseDown$.value = fromEvent<MouseEvent>(canvas, "mousedown");
		mouseMove$.value = fromEvent<MouseEvent>(canvas, "mousemove");
		mouseUp$.value = fromEvent<MouseEvent>(canvas, "mouseup");
		mouseLeave$.value = fromEvent<MouseEvent>(canvas, "mouseleave");
	};

	const strokeRect = (config: SquareRectConfig) => {
		const context = getCanvasContext(config.canvasType);

		if (context) {
			const { x: startX, y: startY } = config.position;
			const { x: endX, y: endY } = config.endPosition;

			context.strokeStyle = configStore.pixelColor;
			context.lineWidth = configStore.pixelSize;

			const offset = configStore.pixelSize / 2;

			context.strokeRect(
				startX + offset,
				startY + offset,
				endX - startX,
				endY - startY,
			);
		}
	};

	const fillRect = (config: RectConfig) => {
		const { x, y } = config.position;
		const context = getCanvasContext(config.canvasType);

		if (context) {
			context.fillStyle = configStore.pixelColor;
			context.fillRect(x, y, configStore.pixelSize, configStore.pixelSize);
		}
	};

	const clearRect = (config: RectConfig) => {
		const { x, y } = config.position;
		const context = getCanvasContext(config.canvasType);

		context?.clearRect(x, y, configStore.pixelSize, configStore.pixelSize);
	};

	const fillHoverRect = ({ x, y }: Position) => {
		const context = getCanvasContext("preview");

		if (context) {
			context.fillStyle = DEFAULT_HOVERED_PIXEL_COLOR;
			context.fillRect(x, y, configStore.pixelSize, configStore.pixelSize);
		}
	};

	const clearHoverRect = ({ x, y }: Position) => {
		const context = getCanvasContext("preview");

		if (context) {
			context.clearRect(x, y, configStore.pixelSize, configStore.pixelSize);
		}
	};

	const clearAllPixels = (canvasType: CanvasType) => {
		const context = getCanvasContext(canvasType);

		context?.clearRect(0, 0, context.canvas.width, context.canvas.height);
	};

	return {
		getCanvas,
		getCanvasContext,
		initCanvas,
		strokeRect,
		fillRect,
		clearRect,
		fillHoverRect,
		clearHoverRect,
		clearAllPixels,

		mouseDown$,
		mouseMove$,
		mouseUp$,
		mouseLeave$,
		globalMouseUp$,
	};
});
