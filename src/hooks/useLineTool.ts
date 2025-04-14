import { useCanvasStore, useConfigStore } from "@/store";
import { type CanvasType, type Position, ToolTypeEnum } from "@/types";
import { getPixelPosition } from "@/utils";
import { storeToRefs } from "pinia";
import { type Subscription, merge, tap, throttleTime } from "rxjs";
import { ref, watch } from "vue";
import { useHoverPixel } from "./useHover";

const getAlignedStartAndEndPosition = (
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

export function useLineTool() {
	const isDrawingLine = ref(false);
	const lineStartPosition = ref<Position | null>(null);
	const lineEndPosition = ref<Position | null>(null);
	const line$ = ref<Subscription>();

	const configStore = useConfigStore();
	const canvasStore = useCanvasStore();
	const { drawHoverPixel, setHoveredPixel } = useHoverPixel();

	const { toolType, pixelSize } = storeToRefs(configStore);
	const { mouse$, globalMouseUp$ } = storeToRefs(canvasStore);

	watch(toolType, (type) => {
		if (type === ToolTypeEnum.Line) {
			initLineTool();
		} else {
			disposeLineTool();
		}
	});

	const disposeLineTool = () => line$.value?.unsubscribe();

	const initLineTool = () => {
		const { mouseDown$, mouseMove$, mouseUp$, mouseLeave$ } = mouse$.value;

		if (!mouseDown$ || !mouseMove$ || !mouseUp$ || !mouseLeave$) {
			return;
		}

		line$.value = merge(
			mouseDown$.pipe(
				tap((event: MouseEvent) => {
					isDrawingLine.value = true;
					drawLineStart(event);
				}),
			),
			mouseMove$.pipe(
				throttleTime(16),
				tap((event: MouseEvent) => {
					if (isDrawingLine.value) {
						drawLineEnd(event);
					} else {
						drawHoverPixel(event);
					}
				}),
			),
			mouseUp$.pipe(tap(() => tap(() => onMouseUpHandler()))),
			mouseLeave$.pipe(tap(() => setHoveredPixel(null))),
			globalMouseUp$.value.pipe(tap(() => onMouseUpHandler())),
		).subscribe();
	};

	const onMouseUpHandler = () => {
		drawBresenhamLine("main");
		canvasStore.clearAllPixels("preview");
		isDrawingLine.value = false;
		lineStartPosition.value = null;
		lineEndPosition.value = null;
	};

	const drawLineStart = (event: MouseEvent) => {
		const canvas = canvasStore.getCanvas("preview");

		if (canvas) {
			const position = getPixelPosition(canvas, event);
			lineStartPosition.value = position;
			lineEndPosition.value = position;
		}
	};

	const drawLineEnd = (event: MouseEvent) => {
		const canvas = canvasStore.getCanvas("preview");

		if (canvas) {
			lineEndPosition.value = getPixelPosition(canvas, event);
			canvasStore.clearAllPixels("preview");
			drawBresenhamLine("preview");
		}
	};

	const drawBresenhamLine = (canvasType: CanvasType) => {
		if (!lineStartPosition.value || !lineEndPosition.value) {
			return;
		}

		let { startX, startY, endX, endY } = getAlignedStartAndEndPosition(
			lineStartPosition.value,
			lineEndPosition.value,
			pixelSize.value,
		);

		const dx = Math.abs(endX - startX);
		const dy = Math.abs(endY - startY);
		const sx = startX < endX ? pixelSize.value : -pixelSize.value;
		const sy = startY < endY ? pixelSize.value : -pixelSize.value;
		let err = dx - dy;

		while (true) {
			canvasStore.fillRect({
				position: { x: startX, y: startY },
				canvasType,
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
	};
}
