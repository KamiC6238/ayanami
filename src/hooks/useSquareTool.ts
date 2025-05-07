import { useCanvasStore, useConfigStore } from "@/store";
import { type CanvasType, type Position, ToolTypeEnum } from "@/types";
import { storeToRefs } from "pinia";
import { type Subscription, merge, tap, throttleTime } from "rxjs";
import { ref, watch } from "vue";
import { useHoverPixel } from "./useHover";
import { useToolsCommon } from "./useToolsCommon";

export function useSquareTool() {
	const isDrawingSquare = ref(false);
	const squareStartPosition = ref<Position | null>();
	const squareEndPosition = ref<Position | null>();
	const square$ = ref<Subscription>();

	const configTool = useConfigStore();
	const canvasStore = useCanvasStore();
	const { getMousePosition } = useToolsCommon();
	const { drawHoverPixel, setHoveredPixel } = useHoverPixel();

	const { toolType } = storeToRefs(configTool);
	const { mouse$, globalMouseUp$ } = storeToRefs(canvasStore);

	watch(toolType, (type) => {
		if (type === ToolTypeEnum.Square) {
			initSquare();
		} else {
			disposeSquare();
		}
	});

	const disposeSquare = () => square$.value?.unsubscribe();

	const initSquare = () => {
		const { mouseDown$, mouseMove$, mouseUp$, mouseLeave$ } = mouse$.value;

		if (!mouseDown$ || !mouseMove$ || !mouseUp$ || !mouseLeave$) {
			return;
		}

		square$.value = merge(
			mouseDown$.pipe(
				tap((event: MouseEvent) => {
					isDrawingSquare.value = true;
					drawSquareStart(event);
				}),
			),
			mouseMove$.pipe(
				throttleTime(16),
				tap((event: MouseEvent) => {
					if (isDrawingSquare.value) {
						drawSquareEnd(event);
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
		drawSquare("main");
		isDrawingSquare.value = false;

		if (squareStartPosition.value && squareEndPosition.value) {
			canvasStore.record({
				squareStartPosition: { ...squareStartPosition.value },
				squareEndPosition: { ...squareEndPosition.value },
			});
		}

		squareStartPosition.value = null;
		squareEndPosition.value = null;
	};

	const drawSquareStart = (event: MouseEvent) => {
		const position = getMousePosition(event);
		if (!position) return;

		squareStartPosition.value = position;
		squareEndPosition.value = position;
	};

	const drawSquareEnd = (event: MouseEvent) => {
		if (!squareStartPosition.value) return;

		const newSqureEndPosition = getMousePosition(event);

		if (
			!newSqureEndPosition ||
			(newSqureEndPosition.x === squareEndPosition.value?.x &&
				newSqureEndPosition.y === squareEndPosition.value?.y)
		) {
			return;
		}

		squareEndPosition.value = newSqureEndPosition;
		drawSquare("preview");
	};

	const drawSquare = (canvasType: CanvasType) => {
		if (!squareStartPosition.value || !squareEndPosition.value) {
			return;
		}

		if (squareStartPosition.value.x === squareEndPosition.value.x) {
			canvasStore.fillRect({
				position: { ...squareStartPosition.value },
				canvasType,
			});
		} else {
			canvasStore.drawSquare({
				squareStartPosition: { ...squareStartPosition.value },
				squareEndPosition: { ...squareEndPosition.value },
				canvasType,
			});
		}
	};
}
