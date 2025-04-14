import { DEFAULT_HOVERED_PIXEL_COLOR } from "@/constants";
import type {
	CanvasMap,
	CanvasType,
	Position,
	RectConfig,
	SquareRectConfig,
} from "@/types";
import { drawGrid, scaleCanvasByDPR } from "@/utils";
import { defineStore } from "pinia";
import { type Observable, fromEvent } from "rxjs";
import { v4 as uuidV4 } from "uuid";
import { computed, ref } from "vue";
import { useConfigStore } from "./config";

export const useCanvasStore = defineStore("canvas", () => {
	const tabs = ref<Record<string, CanvasMap>>({});
	const currentTabId = ref("");
	const globalMouseUp$ = ref<Observable<MouseEvent>>(
		fromEvent<MouseEvent>(document, "mouseup"),
	);

	const configStore = useConfigStore();

	const canvasMap = computed(() => {
		const _ = tabs.value[currentTabId.value];

		return {
			main: _.main,
			grid: _.grid,
			preview: _.preview,
		};
	});

	const mouse$ = computed(() => {
		const _ = tabs.value[currentTabId.value];

		return {
			mouseDown$: _?.mouseDown$ ?? null,
			mouseMove$: _?.mouseMove$ ?? null,
			mouseUp$: _?.mouseUp$ ?? null,
			mouseLeave$: _?.mouseLeave$ ?? null,
		};
	});

	const setTabId = (tabId: string) => {
		currentTabId.value = tabId;
	};

	const getCanvas = (canvasType: CanvasType) => {
		return canvasMap.value[canvasType];
	};

	const getCanvasContext = (canvasType: CanvasType) => {
		return getCanvas(canvasType)?.getContext("2d");
	};

	const initCanvas = (
		gridCanvas: HTMLCanvasElement,
		mainCanvas: HTMLCanvasElement,
		previewCanvas: HTMLCanvasElement,
	) => {
		const tabId = uuidV4();
		setTabId(tabId);

		if (!tabs.value[tabId]) {
			tabs.value[tabId] = {
				main: mainCanvas,
				preview: previewCanvas,
				grid: gridCanvas,
				mouseDown$: null,
				mouseMove$: null,
				mouseUp$: null,
				mouseLeave$: null,
			};
		}

		initCanvasMouse$(previewCanvas);

		scaleCanvasByDPR(gridCanvas);
		scaleCanvasByDPR(mainCanvas);
		scaleCanvasByDPR(previewCanvas);

		drawGrid(gridCanvas);
	};

	const initCanvasMouse$ = (canvas: HTMLCanvasElement) => {
		if (!currentTabId.value) return;

		tabs.value[currentTabId.value] = {
			...tabs.value[currentTabId.value],
			mouseDown$: fromEvent<MouseEvent>(canvas, "mousedown"),
			mouseMove$: fromEvent<MouseEvent>(canvas, "mousemove"),
			mouseUp$: fromEvent<MouseEvent>(canvas, "mouseup"),
			mouseLeave$: fromEvent<MouseEvent>(canvas, "mouseleave"),
		};
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
		globalMouseUp$,
		mouse$,
		tabs,
		currentTabId,
		setTabId,
	};
});
