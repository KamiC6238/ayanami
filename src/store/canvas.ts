import { DEFAULT_HOVERED_PIXEL_COLOR } from "@/constants";
import type {
	CanvasMap,
	CanvasType,
	CircleConfig,
	LineConfig,
	Position,
	RectConfig,
	SquareRectConfig,
} from "@/types";
import { drawGrid, scaleCanvasByDPR } from "@/utils";
import RenderWorker from "@/worker/renderWorker?worker";
import { defineStore, storeToRefs } from "pinia";
import { type Observable, fromEvent } from "rxjs";
import { v4 as uuidV4 } from "uuid";
import { computed, ref, watch } from "vue";
import { useConfigStore } from "./config";

export const useCanvasStore = defineStore("canvas", () => {
	const tabs = ref<Record<string, CanvasMap>>({});
	const renderWorker = ref<Worker | null>(null);
	const currentTabId = ref("");
	const globalMouseUp$ = ref<Observable<MouseEvent>>(
		fromEvent<MouseEvent>(document, "mouseup"),
	);

	const configStore = useConfigStore();
	const { toolType, pixelColor, pixelSize } = storeToRefs(configStore);

	watch(
		() => currentTabId.value,
		(tabId) => {
			const { main: mainCanvas, preview: previewCanvas } = tabs.value[tabId];

			if (!mainCanvas || !previewCanvas) return;

			renderWorker.value?.terminate();
			renderWorker.value = initOffScreenCanvas([mainCanvas, previewCanvas]);
		},
	);

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
		return renderWorker.value;
	};

	const getCanvas = (canvasType: CanvasType) => {
		return canvasMap.value[canvasType];
	};

	const initOffScreenCanvas = (canvasList: HTMLCanvasElement[]) => {
		const worker = new RenderWorker();
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

		scaleCanvasByDPR(gridCanvas);
		drawGrid(gridCanvas);

		if (!tabs.value[tabId]) {
			tabs.value[tabId] = {
				main: mainCanvas,
				preview: previewCanvas,
				grid: gridCanvas,
				mouseDown$: fromEvent<MouseEvent>(previewCanvas, "mousedown"),
				mouseMove$: fromEvent<MouseEvent>(document, "mousemove"),
				mouseUp$: fromEvent<MouseEvent>(document, "mouseup"),
				mouseLeave$: fromEvent<MouseEvent>(document, "mouseleave"),
			};
		}

		setTabId(tabId);
	};

	const strokeRect = (config: SquareRectConfig) => {
		const worker = getRenderWorker();
		if (!worker) return;

		worker.postMessage({
			type: "strokeRect",
			payload: {
				canvasType: config.canvasType,
				squareStartPosition: config.squareStartPosition,
				squareEndPosition: config.squareEndPosition,
				pixelColor: configStore.pixelColor,
				pixelSize: configStore.pixelSize,
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
				toolType: toolType.value,
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
				toolType: toolType.value,
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

	const drawCircle = (config: CircleConfig) => {
		const worker = getRenderWorker();
		if (!worker) return;

		worker.postMessage({
			type: "drawCircle",
			payload: {
				canvasType: config.canvasType,
				circleStartPosition: config.circleStartPosition,
				circleEndPosition: config.circleEndPosition,
				pixelSize: configStore.pixelSize,
				pixelColor: configStore.pixelColor,
				circleType: configStore.circleType,
			},
		});
	};

	const drawLine = (config: LineConfig) => {
		const worker = getRenderWorker();
		if (!worker) return;

		worker.postMessage({
			type: "drawBresenhamLine",
			payload: {
				canvasType: config.canvasType,
				lineStartPosition: config.lineStartPosition,
				lineEndPosition: config.lineEndPosition,
				pixelSize: configStore.pixelSize,
				pixelColor: configStore.pixelColor,
			},
		});
	};

	const record = (extra = {}) => {
		const worker = getRenderWorker();
		if (!worker) return;

		worker.postMessage({
			type: "record",
			payload: {
				tabId: currentTabId.value,
				toolType: toolType.value,
				pixelSize: pixelSize.value,
				pixelColor: pixelColor.value,
				...extra,
			},
		});
	};

	const redo = () => {
		const worker = getRenderWorker();
		if (!worker) return;

		worker.postMessage({
			type: "redo",
			payload: {
				tabId: currentTabId.value,
			},
		});
	};

	const undo = () => {
		const worker = getRenderWorker();
		if (!worker) return;

		worker.postMessage({
			type: "undo",
			payload: {
				tabId: currentTabId.value,
			},
		});
	};

	return {
		redo,
		undo,
		record,
		getRenderWorker,
		getCanvas,
		initCanvas,
		strokeRect,
		fillRect,
		clearRect,
		fillHoverRect,
		clearHoverRect,
		clearAllPixels,
		drawCircle,
		drawLine,
		globalMouseUp$,
		mouse$,
		tabs,
		currentTabId,
		setTabId,
	};
});
