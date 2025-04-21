import { GRID_SIZE } from "@/constants";
import type {
	CanvasType,
	CircleMessagePayload,
	ClearAllPixelsMessagePayload,
	ClearHoverRectMessagePayload,
	ClearRectMessagePayload,
	EraserRecord,
	FillHoverRectMessagePayload,
	FillRectMessagePayload,
	InitMessagePayload,
	LineMessagePayload,
	PencilRecord,
	Record,
	RecordStack,
	StrokeRectMessagePayload,
} from "@/types";
import { CircleTypeEnum, ToolTypeEnum } from "@/types";
import { getAlignedStartAndEndPosition } from "@/utils";

let mainCanvas: OffscreenCanvas | null = null;
let previewCanvas: OffscreenCanvas | null = null;

export const initOffScreenCanvas = (payload: InitMessagePayload) => {
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

export const getContext = (canvasType: CanvasType) => {
	const canvas = canvasType === "main" ? mainCanvas : previewCanvas;
	return canvas?.getContext("2d");
};

export const fillRect = (payload: FillRectMessagePayload) => {
	const { canvasType, position, pixelColor, pixelSize } = payload;
	const context = getContext(canvasType);

	if (!context) return;

	const { x, y } = position;
	context.fillStyle = pixelColor;
	context.fillRect(x, y, pixelSize, pixelSize);

	if (canvasType === "main") {
		clearAllPixels({ canvasType: "preview" });
	}
};

export const fillHoverRect = (payload: FillHoverRectMessagePayload) => {
	const { canvasType, position, pixelSize, pixelColor } = payload;
	const context = getContext(canvasType);

	if (!context) return;

	const { x, y } = position;
	context.fillStyle = pixelColor;
	context.fillRect(x, y, pixelSize, pixelSize);
};

export const strokeRect = (payload: StrokeRectMessagePayload) => {
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

	if (canvasType === "main") {
		clearAllPixels({ canvasType: "preview" });
	}
};

export const clearRect = (payload: ClearRectMessagePayload) => {
	const { canvasType, position, pixelSize } = payload;
	const context = getContext(canvasType);

	if (!context) return;

	const { x, y } = position;
	context.clearRect(x, y, pixelSize, pixelSize);
};

export const clearHoverRect = (payload: ClearHoverRectMessagePayload) => {
	const { canvasType, position, pixelSize } = payload;
	const context = getContext(canvasType);

	if (!context) return;

	const { x, y } = position;
	context.clearRect(x, y, pixelSize, pixelSize);
};

export const clearAllPixels = (payload: ClearAllPixelsMessagePayload) => {
	const { canvasType } = payload;
	const context = getContext(canvasType);

	if (!context) return;
	context?.clearRect(0, 0, context.canvas.width, context.canvas.height);
};

export const drawBresenhamLine = (payload: LineMessagePayload) => {
	const {
		canvasType,
		lineStartPosition,
		lineEndPosition,
		pixelColor,
		pixelSize,
	} = payload;

	if (canvasType === "preview") {
		clearAllPixels({ canvasType });
	}

	let { startX, startY, endX, endY } = getAlignedStartAndEndPosition(
		lineStartPosition,
		lineEndPosition,
		pixelSize,
	);

	const dx = Math.abs(endX - startX);
	const dy = Math.abs(endY - startY);
	const sx = startX < endX ? pixelSize : -pixelSize;
	const sy = startY < endY ? pixelSize : -pixelSize;
	let err = dx - dy;

	while (true) {
		fillRect({
			position: { x: startX, y: startY },
			canvasType,
			pixelSize,
			pixelColor,
		});

		if (startX === endX && startY === endY) {
			break;
		}

		const e2 = err * 2;

		if (e2 > -dy) {
			err -= dy;
			startX += sx;
		}
		if (e2 < dx) {
			err += dx;
			startY += sy;
		}
	}

	if (canvasType === "main") {
		clearAllPixels({ canvasType: "preview" });
	}
};

export const drawCircle = (payload: CircleMessagePayload) => {
	const {
		canvasType,
		circleStartPosition,
		circleEndPosition,
		circleType,
		pixelSize,
		pixelColor,
	} = payload;

	if (canvasType === "preview") {
		clearAllPixels({ canvasType });
	}

	const { x: endX, y: endY } = circleEndPosition;
	const { x: startX, y: startY } = circleStartPosition;

	const centerX = Math.floor((endX + startX) / 2);
	const centerY = Math.floor((endY + startY) / 2);

	const radiusX = Math.floor(Math.abs(endX - startX) / 2);
	const radiusY = Math.floor(Math.abs(endY - startY) / 2);

	const drawPixel = (x: number, y: number, canvasType: CanvasType) => {
		fillRect({
			position: {
				x: x * GRID_SIZE,
				y: y * GRID_SIZE,
			},
			canvasType,
			pixelSize,
			pixelColor,
		});
	};

	const drawPerfectCircle = (
		centerX: number,
		centerY: number,
		radius: number,
		canvasType: CanvasType,
	) => {
		const pixelCenterX = Math.floor(centerX / GRID_SIZE);
		const pixelCenterY = Math.floor(centerY / GRID_SIZE);
		const pixelRadius = Math.floor(radius / GRID_SIZE);

		let x = 0;
		let y = pixelRadius;
		let d = 1 - pixelRadius;

		const plotCirclePoints = (x: number, y: number) => {
			drawPixel(pixelCenterX + x, pixelCenterY + y, canvasType);
			drawPixel(pixelCenterX + x, pixelCenterY - y, canvasType);
			drawPixel(pixelCenterX - x, pixelCenterY + y, canvasType);
			drawPixel(pixelCenterX - x, pixelCenterY - y, canvasType);
			drawPixel(pixelCenterX + y, pixelCenterY + x, canvasType);
			drawPixel(pixelCenterX + y, pixelCenterY - x, canvasType);
			drawPixel(pixelCenterX - y, pixelCenterY + x, canvasType);
			drawPixel(pixelCenterX - y, pixelCenterY - x, canvasType);
		};

		plotCirclePoints(x, y);

		while (y > x) {
			if (d < 0) {
				d += 2 * x + 3;
			} else {
				d += 2 * (x - y) + 5;
				y--;
			}
			x++;
			plotCirclePoints(x, y);
		}
	};

	const drawEllipseCircle = (
		centerX: number,
		centerY: number,
		radiusX: number,
		radiusY: number,
		canvasType: CanvasType,
	) => {
		const pixelCenterX = Math.floor(centerX / GRID_SIZE);
		const pixelCenterY = Math.floor(centerY / GRID_SIZE);
		const pixelRadiusX = Math.floor(radiusX / GRID_SIZE);
		const pixelRadiusY = Math.floor(radiusY / GRID_SIZE);

		let x = 0;
		let y = pixelRadiusY;
		let d1 =
			pixelRadiusY * pixelRadiusY -
			pixelRadiusX * pixelRadiusX * pixelRadiusY +
			0.25 * pixelRadiusX * pixelRadiusX;

		let dx = 2 * pixelRadiusY * pixelRadiusY * x;
		let dy = 2 * pixelRadiusX * pixelRadiusX * y;

		const plotEllipsePoints = (x: number, y: number) => {
			drawPixel(pixelCenterX + x, pixelCenterY + y, canvasType);
			drawPixel(pixelCenterX - x, pixelCenterY + y, canvasType);
			drawPixel(pixelCenterX + x, pixelCenterY - y, canvasType);
			drawPixel(pixelCenterX - x, pixelCenterY - y, canvasType);
		};

		while (dx < dy) {
			plotEllipsePoints(x, y);
			x++;
			dx += 2 * pixelRadiusY * pixelRadiusY;
			if (d1 < 0) {
				d1 += dx + pixelRadiusY * pixelRadiusY;
			} else {
				y--;
				dy -= 2 * pixelRadiusX * pixelRadiusX;
				d1 += dx - dy + pixelRadiusY * pixelRadiusY;
			}
		}

		let d2 =
			pixelRadiusY * pixelRadiusY * (x + 0.5) * (x + 0.5) +
			pixelRadiusX * pixelRadiusX * (y - 1) * (y - 1) -
			pixelRadiusX * pixelRadiusX * pixelRadiusY * pixelRadiusY;

		while (y >= 0) {
			plotEllipsePoints(x, y);
			y--;
			dy -= 2 * pixelRadiusX * pixelRadiusX;
			if (d2 > 0) {
				d2 += pixelRadiusX * pixelRadiusX - dy;
			} else {
				x++;
				dx += 2 * pixelRadiusY * pixelRadiusY;
				d2 += dx - dy + pixelRadiusX * pixelRadiusX;
			}
		}
	};

	if (circleType === CircleTypeEnum.Circle) {
		drawPerfectCircle(centerX, centerY, radiusX, canvasType);
	} else {
		drawEllipseCircle(centerX, centerY, radiusX, radiusY, canvasType);
	}

	if (canvasType === "main") {
		clearAllPixels({ canvasType: "preview" });
	}
};

export const redo = (recordStack: RecordStack) => {
	const record = recordStack.redoStack.pop();

	if (!record) return;

	recordStack.undoStack.push(record);
	replayRecords([record], "redo");
};

export const undo = (recordStack: RecordStack) => {
	const record = recordStack.undoStack.pop();

	if (!record) return;

	recordStack.redoStack.push(record);
	replayRecords(recordStack.undoStack, "undo");
};

export const replayRecords = (records: Record[], type: "redo" | "undo") => {
	if (type === "undo") {
		clearAllPixels({ canvasType: "main" });
	}

	for (const record of records) {
		const [toolType] = record;

		switch (toolType) {
			case ToolTypeEnum.Pencil: {
				replayPencilRecord(record as PencilRecord);
				break;
			}
			case ToolTypeEnum.Eraser: {
				replayEraserRecord(record as EraserRecord);
				break;
			}
		}
	}
};

const replayPencilRecord = (record: PencilRecord) => {
	const [_, pixelColor, pixelSize, points] = record;
	for (const [x, y, drawCounts] of points) {
		for (let i = 0; i < drawCounts; i++) {
			fillRect({
				position: { x, y },
				canvasType: "main",
				pixelSize,
				pixelColor,
			});
		}
	}
};

const replayEraserRecord = (record: EraserRecord) => {
	const [_, pixelSize, points] = record;
	for (const [x, y] of points) {
		clearRect({
			position: { x, y },
			canvasType: "main",
			pixelSize,
		});
	}
};
