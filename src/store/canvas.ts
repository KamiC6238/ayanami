import { DEFAULT_HOVERED_PIXEL_COLOR } from "@/constants";
import type {
	CanvasMap,
	CanvasType,
	Position,
	RectConfig,
	SquareRectConfig,
} from "@/types";
import { drawGrid, scaleCanvasByDPR } from "@/utils";
import OffscreenCanvasWorker from "@/worker/offscreencanvas.ts?worker";
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

	const getRenderWorker = () => {
		return tabs.value[currentTabId.value].renderWorker;
	};

	const getCanvas = (canvasType: CanvasType) => {
		return canvasMap.value[canvasType];
	};

	const initOffScreenCanvas = (canvasList: HTMLCanvasElement[]) => {
		const worker = new OffscreenCanvasWorker();
		const offscreens = canvasList.map((canvas) =>
			canvas.transferControlToOffscreen(),
		);

		worker.postMessage(
			{
				type: "init",
				payload: {
					canvasList: offscreens,
					clientWidth: canvasList[0].clientWidth,
					clientHeight: canvasList[0].clientHeight,
					dpr: Math.floor(window.devicePixelRatio) || 1,
				},
			},
			[...offscreens],
		);

		return worker;
	};

	const initCanvas = (
		gridCanvas: HTMLCanvasElement,
		mainCanvas: HTMLCanvasElement,
		previewCanvas: HTMLCanvasElement,
	) => {
		const tabId = uuidV4();
		setTabId(tabId);

		scaleCanvasByDPR(gridCanvas);
		drawGrid(gridCanvas);

		if (!tabs.value[tabId]) {
			tabs.value[tabId] = {
				main: mainCanvas,
				preview: previewCanvas,
				grid: gridCanvas,
				renderWorker: initOffScreenCanvas([mainCanvas, previewCanvas]),
				mouseDown$: fromEvent<MouseEvent>(previewCanvas, "mousedown"),
				mouseMove$: fromEvent<MouseEvent>(previewCanvas, "mousemove"),
				mouseUp$: fromEvent<MouseEvent>(previewCanvas, "mouseup"),
				mouseLeave$: fromEvent<MouseEvent>(previewCanvas, "mouseleave"),
			};
		}
	};

	const strokeRect = (config: SquareRectConfig) => {
		const worker = getRenderWorker();
		if (!worker) return;

		worker.postMessage({
			type: "strokeRect",
			payload: {
				canvasType: config.canvasType,
				position: config.position,
				pixelColor: configStore.pixelColor,
				pixelSize: configStore.pixelSize,
				endPosition: config.endPosition,
			},
		});
	};

	const fillRect = (config: RectConfig) => {
		const worker = getRenderWorker();
		if (!worker) return;

		worker.postMessage({
			type: "fillRect",
			payload: {
				canvasType: config.canvasType,
				position: config.position,
				pixelColor: configStore.pixelColor,
				pixelSize: configStore.pixelSize,
			},
		});
	};

	const clearRect = (config: RectConfig) => {
		const worker = getRenderWorker();
		if (!worker) return;

		worker.postMessage({
			type: "clearRect",
			payload: {
				canvasType: config.canvasType,
				position: config.position,
				pixelSize: configStore.pixelSize,
			},
		});
	};

	const fillHoverRect = (position: Position) => {
		const worker = getRenderWorker();
		if (!worker) return;

		worker.postMessage({
			type: "fillHoverRect",
			payload: {
				canvasType: "preview",
				position,
				pixelColor: DEFAULT_HOVERED_PIXEL_COLOR,
				pixelSize: configStore.pixelSize,
			},
		});
	};

	const clearHoverRect = (position: Position) => {
		const worker = getRenderWorker();
		if (!worker) return;

		worker.postMessage({
			type: "clearHoverRect",
			payload: {
				canvasType: "preview",
				position,
				pixelSize: configStore.pixelSize,
			},
		});
	};

	const clearAllPixels = (canvasType: CanvasType) => {
		const worker = getRenderWorker();
		if (!worker) return;

		worker.postMessage({
			type: "clearAllPixels",
			payload: {
				canvasType,
			},
		});
	};

	return {
		getRenderWorker,
		getCanvas,
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
