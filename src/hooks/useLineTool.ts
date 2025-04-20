import { useCanvasStore, useConfigStore } from "@/store";
import { type CanvasType, type Position, ToolTypeEnum } from "@/types";
import { getPixelPosition } from "@/utils";
import { storeToRefs } from "pinia";
import { type Subscription, merge, tap, throttleTime } from "rxjs";
import { ref, watch } from "vue";
import { useHoverPixel } from "./useHover";

export function useLineTool() {
	const isDrawingLine = ref(false);
	const lineStartPosition = ref<Position | null>(null);
	const lineEndPosition = ref<Position | null>(null);
	const line$ = ref<Subscription>();

	const configStore = useConfigStore();
	const canvasStore = useCanvasStore();
	const { drawHoverPixel, setHoveredPixel } = useHoverPixel();

	const { toolType, pixelSize, pixelColor } = storeToRefs(configStore);
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
			const newLineEndPosition = getPixelPosition(canvas, event);

			if (
				newLineEndPosition.x === lineEndPosition.value?.x &&
				newLineEndPosition.y === lineEndPosition.value?.y
			) {
				return;
			}

			lineEndPosition.value = newLineEndPosition;
			drawBresenhamLine("preview");
		}
	};

	const drawBresenhamLine = (canvasType: CanvasType) => {
		const worker = canvasStore.getWorker();
		if (!worker) return;

		worker.postMessage({
			type: "drawBresenhamLine",
			payload: {
				canvasType,
				lineStartPosition: { ...lineStartPosition.value },
				lineEndPosition: { ...lineEndPosition.value },
				pixelSize: pixelSize.value,
				pixelColor: pixelColor.value,
			},
		});
	};
}
