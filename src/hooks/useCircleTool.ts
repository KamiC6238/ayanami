import { GRID_SIZE } from "@/constants";
import { useCanvasStore, useConfigStore } from "@/store";
import {
	type CanvasType,
	CircleTypeEnum,
	type Position,
	ToolTypeEnum,
} from "@/types";
import { getPixelPosition } from "@/utils";
import { storeToRefs } from "pinia";
import { type Subscription, merge, tap, throttleTime } from "rxjs";
import { ref, watch } from "vue";
import { useHoverPixel } from "./useHover";

export function useCircleTool() {
	const isDrawingCircle = ref(false);
	const circleStartPosition = ref<Position | null>();
	const circleEndPosition = ref<Position | null>();
	const circle$ = ref<Subscription>();
	const circleType = ref<CircleTypeEnum>(CircleTypeEnum.Circle);

	const configStore = useConfigStore();
	const canvasStore = useCanvasStore();
	const { drawHoverPixel, setHoveredPixel } = useHoverPixel();

	const { toolType } = storeToRefs(configStore);
	const { mouseDown$, mouseLeave$, mouseMove$, mouseUp$, globalMouseUp$ } =
		storeToRefs(canvasStore);

	watch(toolType, (type) => {
		if (type === ToolTypeEnum.Circle) {
			initCircle();
		} else {
			disposeCircle();
		}
	});

	const disposeCircle = () => circle$.value?.unsubscribe();

	const initCircle = () => {
		if (
			!mouseDown$.value ||
			!mouseMove$.value ||
			!mouseUp$.value ||
			!mouseLeave$.value
		) {
			return;
		}

		circle$.value = merge(
			mouseDown$.value.pipe(
				tap((event: MouseEvent) => {
					isDrawingCircle.value = true;
					drawCircleStart(event);
				}),
			),
			mouseMove$.value.pipe(
				throttleTime(16),
				tap((event: MouseEvent) => {
					if (isDrawingCircle.value) {
						drawCircleEnd(event);
					} else {
						drawHoverPixel(event);
					}
				}),
			),
			mouseUp$.value.pipe(tap(() => onMouseUpHandler())),
			mouseLeave$.value.pipe(tap(() => setHoveredPixel(null))),
			globalMouseUp$.value.pipe(tap(() => onMouseUpHandler())),
		).subscribe();
	};

	const onMouseUpHandler = () => {
		drawCircle("main");
		canvasStore.clearAllPixels("preview");
		isDrawingCircle.value = false;
		circleStartPosition.value = null;
		circleEndPosition.value = null;
	};

	const drawCircleStart = (event: MouseEvent) => {
		const canvas = canvasStore.getCanvas("preview");

		if (canvas) {
			const position = getPixelPosition(canvas, event);
			circleStartPosition.value = position;
			circleEndPosition.value = position;
		}
	};

	const drawCircleEnd = (event: MouseEvent) => {
		const canvas = canvasStore.getCanvas("preview");

		if (!circleStartPosition.value) return;

		if (canvas) {
			canvasStore.clearAllPixels("preview");
			circleEndPosition.value = getPixelPosition(canvas, event);
			drawCircle("preview");
		}
	};

	const drawPixel = (x: number, y: number, canvasType: CanvasType) => {
		const context = canvasStore.getCanvasContext(canvasType);
		if (!context) return;

		canvasStore.fillRect({
			position: {
				x: x * GRID_SIZE,
				y: y * GRID_SIZE,
			},
			canvasType,
		});
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

	const drawCircle = (canvasType: CanvasType) => {
		if (!circleStartPosition.value || !circleEndPosition.value) {
			return;
		}

		const canvas = canvasStore.getCanvas(canvasType);

		if (!canvas) return;

		const { x: endX, y: endY } = circleEndPosition.value;
		const { x: startX, y: startY } = circleStartPosition.value;

		const centerX = Math.floor((endX + startX) / 2);
		const centerY = Math.floor((endY + startY) / 2);

		const radiusX = Math.floor(Math.abs(endX - startX) / 2);
		const radiusY = Math.floor(Math.abs(endY - startY) / 2);

		if (circleType.value === CircleTypeEnum.Circle) {
			drawPerfectCircle(centerX, centerY, radiusX, canvasType);
		} else {
			drawEllipseCircle(centerX, centerY, radiusX, radiusY, canvasType);
		}
	};

	const setCircleType = (type: CircleTypeEnum) => {
		circleType.value = type;
	};

	return {
		setCircleType,
	};
}
