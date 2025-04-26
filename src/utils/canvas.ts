import { DEFAULT_PIXEL_SIZE } from "@/constants";
import type { Position } from "@/types";

export function scaleCanvasByDPR(canvas: HTMLCanvasElement) {
	const dpr = Math.floor(window.devicePixelRatio) || 1;

	canvas.width = canvas.clientWidth * dpr;
	canvas.height = canvas.clientHeight * dpr;
	canvas.getContext("2d")?.scale(dpr, dpr);
}

export function drawGrid(
	canvas: OffscreenCanvas,
	config: {
		clientWidth: number;
		clientHeight: number;
	},
) {
	const context = canvas.getContext("2d");

	if (!context) return;

	const { clientWidth: width, clientHeight: height } = config;
	const centerX = Math.floor(width / 2);
	const centerY = Math.floor(height / 2);

	for (let x = 0; x < width; x += DEFAULT_PIXEL_SIZE) {
		for (let y = 0; y < height; y += DEFAULT_PIXEL_SIZE) {
			const isTopLeft = x < centerX && y < centerY;
			const isBottomRight = x >= centerX && y >= centerY;

			if (isTopLeft || isBottomRight) {
				context.fillStyle = "#808081";
			} else {
				context.fillStyle = "#c0c0c0";
			}

			context.fillRect(x, y, DEFAULT_PIXEL_SIZE, DEFAULT_PIXEL_SIZE);
		}
	}
}

// for line tool
export const getAlignedStartAndEndPosition = (
	lineStartPosition: Position,
	lineEndPosition: Position,
	pixelSize: number,
) => {
	let { x: startX, y: startY } = lineStartPosition;
	let { x: endX, y: endY } = lineEndPosition;

	startX = Math.floor(startX / pixelSize) * pixelSize;
	startY = Math.floor(startY / pixelSize) * pixelSize;
	endX = Math.floor(endX / pixelSize) * pixelSize;
	endY = Math.floor(endY / pixelSize) * pixelSize;

	return {
		startX,
		startY,
		endX,
		endY,
	};
};
