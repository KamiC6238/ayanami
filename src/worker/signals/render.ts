import type { InitMessagePayload } from "@/types";
import type { Position } from "@/types";
import type { CanvasType } from "@/types";
import { drawGrid } from "@/utils/canvas";
import { signal } from "alien-signals";

const mainCanvas = signal<OffscreenCanvas | null>(null);
const previewCanvas = signal<OffscreenCanvas | null>(null);
const gridCanvas = signal<OffscreenCanvas | null>(null);

const visited = signal<Set<string>>(new Set());
const tempVisited = signal<Set<string>>(new Set());

const colorPositionMap = signal<Map<string, string>>(new Map());
const colorPositionMapBackup = signal<Map<string, string>>(new Map());

export const useRender = () => {
	const initOffScreenCanvas = (payload: InitMessagePayload) => {
		const { dpr, clientWidth, clientHeight, canvasList } =
			payload as InitMessagePayload;

		mainCanvas(canvasList[0]);
		previewCanvas(canvasList[1]);
		gridCanvas(canvasList[2]);

		for (const canvas of canvasList) {
			canvas.width = clientWidth * dpr;
			canvas.height = clientHeight * dpr;
			canvas.getContext("2d")?.scale(dpr, dpr);
		}

		const _gridCanvas = gridCanvas();
		if (!_gridCanvas) return;

		const _map = drawGrid(_gridCanvas, { clientWidth, clientHeight });
		setColorPositionMapBackup(_map);
		resetColorPositionMap();
	};

	const getCanvas = (canvasType: CanvasType) => {
		return canvasType === "main" ? mainCanvas() : previewCanvas();
	};

	const getContext = (canvasType: CanvasType) => {
		const canvas = getCanvas(canvasType);
		return canvas?.getContext("2d");
	};

	const getColorPosition = (key: string) => colorPositionMap().get(key);

	const getColorPositionMap = () => colorPositionMap();

	const setColorPositionMap = (map: Map<string, string>) =>
		colorPositionMap(map);

	const setColorPositionMapBackup = (map: Map<string, string>) =>
		colorPositionMapBackup(map);

	const resetColorPositionMap = () =>
		colorPositionMap(new Map(colorPositionMapBackup()));

	const updateColorPositionMap = (key: string, color: string) => {
		const [x, y] = key.split("_");
		const position = {
			x: Number(x),
			y: Number(y),
		};
		const checkIsValidPosition = (position: Position) => {
			const _mainCanvas = mainCanvas();
			if (!_mainCanvas) return false;

			const { width, height } = _mainCanvas;
			const styleWidth = width / 2;
			const styleHeight = height / 2;
			const { x, y } = position;

			if (x < 0 || x > styleWidth) return false;
			if (y < 0 || y > styleHeight) return false;
			return true;
		};

		if (checkIsValidPosition(position)) {
			setColorPosition(key, color);
		}
	};

	const hasVisited = (key: string) => visited().has(key);

	const hasTempVisited = (key: string) => tempVisited().has(key);

	const addVisited = (key: string) => visited().add(key);

	const addTempVisited = (key: string) => tempVisited().add(key);

	const setColorPosition = (key: string, color: string) =>
		colorPositionMap().set(key, color);

	const clearVisited = () => visited().clear();

	const clearTempVisited = () => tempVisited().clear();

	const clearVisitedPosition = () => {
		clearVisited();
		clearTempVisited();
	};

	return {
		initOffScreenCanvas,
		getCanvas,
		getContext,
		getColorPosition,
		getColorPositionMap,
		setColorPositionMap,
		setColorPositionMapBackup,
		resetColorPositionMap,
		updateColorPositionMap,
		hasVisited,
		hasTempVisited,
		addVisited,
		addTempVisited,
		setColorPosition,
		clearVisited,
		clearTempVisited,
		clearVisitedPosition,
	};
};
