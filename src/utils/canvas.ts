import { DEFAULT_PIXEL_SIZE } from "@/constants";
// import type { Record } from '@/types';

export function scaleCanvasByDPR(canvas: HTMLCanvasElement) {
	const dpr = Math.floor(window.devicePixelRatio) || 1;

	canvas.width = canvas.clientWidth * dpr;
	canvas.height = canvas.clientHeight * dpr;
	canvas.getContext("2d")?.scale(dpr, dpr);
}

export function drawGrid(canvas: HTMLCanvasElement) {
	const context = canvas.getContext("2d");

	if (!context) return;

	const { clientWidth: width, clientHeight: height } = canvas;
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

// export function applyRecords(canvas: HTMLCanvasElement, records: Record[]) {
//   const context = canvas.getContext("2d");

//   if (!context) return;

//   context.clearRect(0, 0, canvas.width, canvas.height);

//   let drawIndex = 0;
//   const drawQueue: { x: number; y: number; pixelSize: number; color: string }[] = [];

//   for (const record of records) {
//     const [_, color, pixelSize, points] = record;

//     for (const [x, y, drawCounts] of points) {
//       for (let i = 0; i < drawCounts; i++) {
//         drawQueue.push({ x, y, pixelSize, color });
//       }
//     }
//   }

//   function drawNext() {
//     if (!context) return
//     if (drawIndex >= drawQueue.length) return;

//     const { x, y, pixelSize, color } = drawQueue[drawIndex];
//     context.fillStyle = color;
//     context.fillRect(x, y, pixelSize, pixelSize);

//     drawIndex++;
//     setTimeout(drawNext, 10);
//   }

//   drawNext();
// }
