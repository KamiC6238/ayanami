import { DEFAULT_PIXEL_SIZE } from "@/constants";

export function scaleCanvasByDPR(canvas: HTMLCanvasElement) {
	const dpr = Math.floor(window.devicePixelRatio) || 1;

	canvas.width = canvas.clientWidth * dpr;
	canvas.height = canvas.clientHeight * dpr;
	canvas.getContext("2d")?.scale(dpr, dpr);
}

export function drawGrid(canvas: HTMLCanvasElement) {
	const context = canvas.getContext("2d");

	if (!context) return;

	const { width, height } = canvas;

	for (let x = 0; x < width; x += DEFAULT_PIXEL_SIZE) {
		for (let y = 0; y < height; y += DEFAULT_PIXEL_SIZE) {
			const row = Math.floor(x / DEFAULT_PIXEL_SIZE);
			const col = Math.floor(y / DEFAULT_PIXEL_SIZE);

			context.fillStyle = (row + col) % 2 === 1 ? "white" : "rgba(0,0,0,0.08)";
			context.fillRect(x, y, DEFAULT_PIXEL_SIZE, DEFAULT_PIXEL_SIZE);
		}
	}
}
