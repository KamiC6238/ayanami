import { DEFAULT_PIXEL_SIZE } from "@/constants";
import { ExportTypeEnum, type Position } from "@/types";

export function scaleCanvasByDPR(canvas: HTMLCanvasElement) {
	const dpr = Math.floor(window.devicePixelRatio) || 1;

	canvas.width = canvas.clientWidth * dpr;
	canvas.height = canvas.clientHeight * dpr;
	canvas.getContext("2d")?.scale(dpr, dpr);
}

export function makeColorPositionKey({ x, y }: Position) {
	return `${x}_${y}`;
}

export function drawGrid(
	canvas: OffscreenCanvas,
	config: {
		clientWidth: number;
		clientHeight: number;
	},
) {
	const colorPositionMap = new Map<string, string>();
	const context = canvas.getContext("2d");

	if (!context) return colorPositionMap;

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

			colorPositionMap.set(makeColorPositionKey({ x, y }), "");
			context.fillRect(x, y, DEFAULT_PIXEL_SIZE, DEFAULT_PIXEL_SIZE);
		}
	}

	return colorPositionMap;
}

export const save = (
	blob: Blob,
	config: {
		filename: string;
		exportType: ExportTypeEnum;
	},
) => {
	const { filename, exportType } = config;
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download =
		exportType === ExportTypeEnum.Source ? `${filename}.ayanami` : filename;
	a.style.display = "none";

	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);

	URL.revokeObjectURL(url);
};
