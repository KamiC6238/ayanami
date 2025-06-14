import { DEFAULT_PIXEL_SIZE, GRID_SIZE } from "@/constants";
import type {
	BucketMessagePayload,
	CanvasType,
	CircleMessagePayload,
	ClearAllPixelsMessagePayload,
	ClearHoverRectMessagePayload,
	ClearRectMessagePayload,
	FillHoverRectMessagePayload,
	FillRectMessagePayload,
	LineMessagePayload,
	Position,
	SquareMessagePayload,
} from "@/types";
import { ToolTypeEnum } from "@/types";
import {
	blendHexColors,
	getOffsetPosition,
	makeColorPositionKey,
} from "@/utils";
import { useRecords, useRender } from "../signals";

const { updatePointsRecord } = useRecords();

const {
	getCanvas,
	getContext,
	getColorPosition,
	resetColorPositionMap,
	updateColorPositionMap,
	hasVisited,
	hasTempVisited,
	addVisited,
	addTempVisited,
	setColorPosition,
	clearTempVisited,
} = useRender();

export const fillRect = (payload: FillRectMessagePayload) => {
	const { toolType, canvasType, position, pixelColor, pixelSize, isReplay } =
		payload;
	const context = getContext(canvasType);

	if (!context) return;

	const offsetPosition = isReplay
		? position
		: getOffsetPosition(position, pixelSize);

	if (canvasType === "main") {
		clearAllPixels({ canvasType: "preview" });
	}

	/**
	 * do not update point record during redo or undo
	 * */
	if (!isReplay && toolType === ToolTypeEnum.Pencil) {
		updatePointsRecord({
			toolType,
			position: offsetPosition,
		});
	}

	const { x, y } = offsetPosition;
	const size = pixelSize / DEFAULT_PIXEL_SIZE;
	context.fillStyle = pixelColor;

	if (toolType && toolType !== ToolTypeEnum.Broom) {
		for (let i = 0; i < size; i++) {
			for (let j = 0; j < size; j++) {
				const _x = i * DEFAULT_PIXEL_SIZE + x;
				const _y = j * DEFAULT_PIXEL_SIZE + y;
				const key = makeColorPositionKey({ x: _x, y: _y });

				if (canvasType === "main") {
					if (hasVisited(key)) continue;
					addVisited(key);

					const existedColor = getColorPosition(key);

					if (existedColor) {
						updateColorPositionMap(
							key,
							blendHexColors(existedColor, pixelColor),
						);
					} else {
						updateColorPositionMap(key, pixelColor);
					}
				} else {
					/**
					 * for tools need preview before drawing at mainCanvas
					 * like line/circle/square
					 */
					if (hasTempVisited(key)) continue;
					addTempVisited(key);
				}

				context.fillRect(_x, _y, DEFAULT_PIXEL_SIZE, DEFAULT_PIXEL_SIZE);
			}
		}
	} else {
		// for fill hover rect during mousemove
		context.fillRect(x, y, pixelSize, pixelSize);
	}
};

export const fillHoverRect = (payload: FillHoverRectMessagePayload) => {
	fillRect({ ...payload });
};

export const drawSquare = (payload: SquareMessagePayload) => {
	const {
		canvasType,
		squareStartPosition,
		squareEndPosition,
		pixelSize,
		pixelColor,
	} = payload;

	clearTempVisited();

	if (canvasType === "main") {
		clearAllPixels({ canvasType: "preview" });
	}

	if (canvasType === "preview") {
		clearAllPixels({ canvasType });
	}

	let { x: startX, y: startY } = squareStartPosition;
	let { x: endX, y: endY } = squareEndPosition;

	if (startX > endX) [startX, endX] = [endX, startX];
	if (startY > endY) [startY, endY] = [endY, startY];

	const commonConfig = {
		toolType: ToolTypeEnum.Square,
		canvasType,
		pixelSize,
		pixelColor,
	};

	for (let x = startX; x <= endX; x += DEFAULT_PIXEL_SIZE) {
		fillRect({ position: { x, y: startY }, ...commonConfig });
		fillRect({ position: { x, y: endY }, ...commonConfig });
	}

	for (let y = startY + pixelSize; y <= endY; y += DEFAULT_PIXEL_SIZE) {
		fillRect({ position: { x: startX, y }, ...commonConfig });
		fillRect({ position: { x: endX, y }, ...commonConfig });
	}
};

export const fillBucket = (payload: BucketMessagePayload) => {
	const mainCanvas = getCanvas("main");
	const context = getContext("main");
	if (!mainCanvas || !context) return;

	const { position, replacementColor, pixelSize } = payload;

	const { width, height } = mainCanvas;
	const queue = [{ x: position.x, y: position.y }];
	const targetColor = getColorPosition(makeColorPositionKey(position));
	const visited = new Set<string>();

	while (queue.length > 0) {
		const pos = queue.pop() as Position;
		const { x, y } = pos;
		const curPositionColorKey = makeColorPositionKey(pos);
		const curPositionColor = getColorPosition(curPositionColorKey);

		if (
			x < 0 ||
			x >= width ||
			y < 0 ||
			y >= height ||
			visited.has(curPositionColorKey) ||
			curPositionColor !== targetColor
		) {
			continue;
		}

		visited.add(curPositionColorKey);

		fillRect({
			toolType: ToolTypeEnum.Bucket,
			position: pos,
			canvasType: "main",
			pixelColor: replacementColor,
			pixelSize,
		});

		queue.push({ x: pos.x, y: pos.y - pixelSize });
		queue.push({ x: pos.x + pixelSize, y });
		queue.push({ x: pos.x, y: pos.y + pixelSize });
		queue.push({ x: pos.x - pixelSize, y });
	}
};

export const clearRect = (payload: ClearRectMessagePayload) => {
	const { toolType, canvasType, position, pixelSize, isReplay } = payload;
	const context = getContext(canvasType);
	if (!context) return;

	const offsetPosition = isReplay
		? position
		: getOffsetPosition(position, pixelSize);

	/**
	 * do not update point record during redo or undo
	 * */
	if (!isReplay && toolType === ToolTypeEnum.Eraser) {
		updatePointsRecord({
			toolType: ToolTypeEnum.Eraser,
			position: offsetPosition,
		});
	}

	if (canvasType === "main") {
		const size = pixelSize / DEFAULT_PIXEL_SIZE;

		for (let i = 0; i < size; i++) {
			for (let j = 0; j < size; j++) {
				const x = i * DEFAULT_PIXEL_SIZE + offsetPosition.x;
				const y = j * DEFAULT_PIXEL_SIZE + offsetPosition.y;
				const key = makeColorPositionKey({ x, y });
				setColorPosition(key, "");
			}
		}
	}

	context.clearRect(offsetPosition.x, offsetPosition.y, pixelSize, pixelSize);
};

export const clearHoverRect = (payload: ClearHoverRectMessagePayload) => {
	clearRect({ ...payload });
};

export const clearAllPixels = (payload: ClearAllPixelsMessagePayload) => {
	const { canvasType } = payload;
	const context = getContext(canvasType);

	if (!context) return;
	context?.clearRect(0, 0, context.canvas.width, context.canvas.height);

	if (canvasType === "main") {
		resetColorPositionMap();
	}
};

export const drawBresenhamLine = (payload: LineMessagePayload) => {
	const {
		toolType,
		canvasType,
		lineStartPosition,
		lineEndPosition,
		pixelColor,
		pixelSize,
	} = payload;

	clearTempVisited();

	if (canvasType === "preview") {
		clearAllPixels({ canvasType });
	}

	if (canvasType === "main") {
		clearAllPixels({ canvasType: "preview" });
	}

	let { x: startX, y: startY } = lineStartPosition;
	const { x: endX, y: endY } = lineEndPosition;

	const dx = Math.abs(endX - startX);
	const dy = Math.abs(endY - startY);
	const sx = startX < endX ? DEFAULT_PIXEL_SIZE : -DEFAULT_PIXEL_SIZE;
	const sy = startY < endY ? DEFAULT_PIXEL_SIZE : -DEFAULT_PIXEL_SIZE;
	let err = dx - dy;

	while (true) {
		const position = { x: startX, y: startY };
		const commonConfig = { toolType, position, pixelSize };

		if (toolType === ToolTypeEnum.Eraser) {
			clearRect({
				canvasType: "main",
				...commonConfig,
			});
		} else {
			fillRect({
				canvasType,
				pixelColor,
				...commonConfig,
			});
		}

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
};

export const drawCircle = (payload: CircleMessagePayload) => {
	const {
		canvasType,
		circleStartPosition,
		circleEndPosition,
		toolType,
		pixelSize,
		pixelColor,
	} = payload;

	clearTempVisited();

	if (canvasType === "preview") {
		clearAllPixels({ canvasType });
	}

	if (canvasType === "main") {
		clearAllPixels({ canvasType: "preview" });
	}

	const { x: endX, y: endY } = circleEndPosition;
	const { x: startX, y: startY } = circleStartPosition;

	const centerX = Math.floor((endX + startX) / 2);
	const centerY = Math.floor((endY + startY) / 2);

	const radiusX = Math.floor(Math.abs(endX - startX) / 2);
	const radiusY = Math.floor(Math.abs(endY - startY) / 2);

	const drawPixel = (x: number, y: number, canvasType: CanvasType) => {
		fillRect({
			toolType: ToolTypeEnum.Circle,
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

	if (toolType === ToolTypeEnum.Circle) {
		drawPerfectCircle(centerX, centerY, radiusX, canvasType);
	} else {
		drawEllipseCircle(centerX, centerY, radiusX, radiusY, canvasType);
	}
};
