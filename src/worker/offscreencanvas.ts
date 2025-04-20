import type {
	CanvasType,
	ClearAllPixelsMessagePayload,
	ClearHoverRectMessagePayload,
	ClearRectMessagePayload,
	FillHoverRectMessagePayload,
	FillRectMessagePayload,
	InitMessagePayload,
	OffscreenCanvasWorkerMessage,
	StrokeRectMessagePayload,
} from "@/types";

let mainCanvas: HTMLCanvasElement | null = null;
let previewCanvas: HTMLCanvasElement | null = null;

self.onmessage = (e: MessageEvent<OffscreenCanvasWorkerMessage>) => {
	const { type, payload } = e.data;

	switch (type) {
		case "init":
			initOffScreenCanvas(payload as InitMessagePayload);
			break;
		case "fillRect":
			fillRect(payload as FillRectMessagePayload);
			break;
		case "fillHoverRect":
			fillHoverRect(payload as FillHoverRectMessagePayload);
			break;
		case "strokeRect":
			strokeRect(payload as StrokeRectMessagePayload);
			break;
		case "clearRect":
			clearRect(payload as ClearRectMessagePayload);
			break;
		case "clearHoverRect":
			clearHoverRect(payload as ClearHoverRectMessagePayload);
			break;
		case "clearAllPixels":
			clearAllPixels(payload as ClearAllPixelsMessagePayload);
			break;
	}
};

const getContext = (canvasType: CanvasType) => {
	const canvas = canvasType === "main" ? mainCanvas : previewCanvas;
	return canvas?.getContext("2d");
};

const initOffScreenCanvas = (payload: InitMessagePayload) => {
	const { dpr, clientWidth, clientHeight, canvasList } =
		payload as InitMessagePayload;

	mainCanvas = canvasList[0]; // main canvas
	previewCanvas = canvasList[1]; // preview canvas

	for (const canvas of canvasList) {
		canvas.width = clientWidth * dpr;
		canvas.height = clientHeight * dpr;
		canvas.getContext("2d")?.scale(dpr, dpr);
	}
};

const fillRect = (payload: FillRectMessagePayload) => {
	const { canvasType, position, pixelColor, pixelSize } = payload;
	const context = getContext(canvasType);

	if (!context) return;

	const { x, y } = position;
	context.fillStyle = pixelColor;
	context.fillRect(x, y, pixelSize, pixelSize);
};

const fillHoverRect = (payload: FillHoverRectMessagePayload) => {
	const { canvasType, position, pixelSize, pixelColor } = payload;
	const context = getContext(canvasType);

	if (!context) return;

	const { x, y } = position;
	context.fillStyle = pixelColor;
	context.fillRect(x, y, pixelSize, pixelSize);
};

const strokeRect = (payload: StrokeRectMessagePayload) => {
	const { canvasType, position, pixelSize, pixelColor, endPosition } = payload;
	const context = getContext(canvasType);

	if (!context) return;

	const { x: startX, y: startY } = position;
	const { x: endX, y: endY } = endPosition;

	context.strokeStyle = pixelColor;
	context.lineWidth = pixelSize;

	const offset = pixelSize / 2;

	if (canvasType === "preview") {
		clearAllPixels({ canvasType });
	}

	context.strokeRect(
		startX + offset,
		startY + offset,
		endX - startX,
		endY - startY,
	);
};

const clearRect = (payload: ClearRectMessagePayload) => {
	const { canvasType, position, pixelSize } = payload;
	const context = getContext(canvasType);

	if (!context) return;

	const { x, y } = position;
	context.clearRect(x, y, pixelSize, pixelSize);
};

const clearHoverRect = (payload: ClearHoverRectMessagePayload) => {
	const { canvasType, position, pixelSize } = payload;
	const context = getContext(canvasType);

	if (!context) return;

	const { x, y } = position;
	context.clearRect(x, y, pixelSize, pixelSize);
};

const clearAllPixels = (payload: ClearAllPixelsMessagePayload) => {
	const { canvasType } = payload;
	const context = getContext(canvasType);

	if (!context) return;
	context?.clearRect(0, 0, context.canvas.width, context.canvas.height);
};
