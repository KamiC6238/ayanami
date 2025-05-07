import { useCanvasStore, useConfigStore } from "@/store";
import { type CanvasType, type Position, ToolTypeEnum } from "@/types";
import { storeToRefs } from "pinia";
import { type Subscription, merge, tap, throttleTime } from "rxjs";
import { ref, watch } from "vue";
import { useHoverPixel } from "./useHover";
import { useToolsCommon } from "./useToolsCommon";

export function useLineTool() {
	const isDrawingLine = ref(false);
	const lineStartPosition = ref<Position | null>(null);
	const lineEndPosition = ref<Position | null>(null);
	const line$ = ref<Subscription>();

	const configStore = useConfigStore();
	const canvasStore = useCanvasStore();
	const { getMousePosition } = useToolsCommon();
	const { drawHoverPixel, setHoveredPixel } = useHoverPixel();

	const { toolType } = storeToRefs(configStore);
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
			mouseUp$.pipe(tap(() => onMouseUpHandler())),
			mouseLeave$.pipe(tap(() => setHoveredPixel(null))),
			globalMouseUp$.value.pipe(tap(() => onMouseUpHandler())),
		).subscribe();
	};

	const onMouseUpHandler = () => {
		drawBresenhamLine("main");
		isDrawingLine.value = false;

		if (lineStartPosition.value && lineEndPosition.value) {
			canvasStore.record({
				lineStartPosition: { ...lineStartPosition.value },
				lineEndPosition: { ...lineEndPosition.value },
			});
		}

		lineStartPosition.value = null;
		lineEndPosition.value = null;
	};

	const drawLineStart = (event: MouseEvent) => {
		const position = getMousePosition(event);
		if (!position) return;

		lineStartPosition.value = position;
		lineEndPosition.value = position;
	};

	const drawLineEnd = (event: MouseEvent) => {
		if (!lineStartPosition.value) return;

		const newLineEndPosition = getMousePosition(event);

		if (
			!newLineEndPosition ||
			(newLineEndPosition.x === lineEndPosition.value?.x &&
				newLineEndPosition.y === lineEndPosition.value?.y)
		) {
			return;
		}

		lineEndPosition.value = newLineEndPosition;
		drawBresenhamLine("preview");
	};

	const drawBresenhamLine = (canvasType: CanvasType) => {
		if (!lineStartPosition.value || !lineEndPosition.value) {
			return;
		}

		canvasStore.drawLine({
			toolType: ToolTypeEnum.Line,
			canvasType,
			lineStartPosition: { ...lineStartPosition.value },
			lineEndPosition: { ...lineEndPosition.value },
		});
	};
}
