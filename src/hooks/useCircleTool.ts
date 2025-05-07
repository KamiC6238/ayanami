import { useCanvasStore, useConfigStore } from "@/store";
import { type CanvasType, type Position, ToolTypeEnum } from "@/types";
import { storeToRefs } from "pinia";
import { type Subscription, merge, tap, throttleTime } from "rxjs";
import { ref, watch } from "vue";
import { useHoverPixel } from "./useHover";
import { useToolsCommon } from "./useToolsCommon";

export function useCircleTool() {
	const isDrawingCircle = ref(false);
	const circleStartPosition = ref<Position | null>();
	const circleEndPosition = ref<Position | null>();
	const circle$ = ref<Subscription | null>();

	const configStore = useConfigStore();
	const canvasStore = useCanvasStore();
	const { getMousePosition } = useToolsCommon();
	const { drawHoverPixel, setHoveredPixel } = useHoverPixel();

	const { toolType } = storeToRefs(configStore);
	const { mouse$, globalMouseUp$ } = storeToRefs(canvasStore);

	watch(toolType, (type) => {
		if (type === ToolTypeEnum.Circle || type === ToolTypeEnum.Ellipse) {
			initCircle();
		} else {
			disposeCircle();
		}
	});

	const disposeCircle = () => {
		circle$.value?.unsubscribe();
		circle$.value = null;
	};

	const initCircle = () => {
		const { mouseDown$, mouseMove$, mouseUp$, mouseLeave$ } = mouse$.value;

		if (
			circle$.value ||
			!mouseDown$ ||
			!mouseMove$ ||
			!mouseUp$ ||
			!mouseLeave$
		) {
			return;
		}

		circle$.value = merge(
			mouseDown$.pipe(
				tap((event: MouseEvent) => {
					isDrawingCircle.value = true;
					drawCircleStart(event);
				}),
			),
			mouseMove$.pipe(
				throttleTime(16),
				tap((event: MouseEvent) => {
					if (isDrawingCircle.value) {
						drawCircleEnd(event);
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
		drawCircle("main");
		isDrawingCircle.value = false;

		if (circleStartPosition.value && circleEndPosition.value) {
			canvasStore.record({
				circleStartPosition: { ...circleStartPosition.value },
				circleEndPosition: { ...circleEndPosition.value },
			});
		}

		circleStartPosition.value = null;
		circleEndPosition.value = null;
	};

	const drawCircleStart = (event: MouseEvent) => {
		const position = getMousePosition(event);
		if (!position) return;

		circleStartPosition.value = position;
		circleEndPosition.value = position;
	};

	const drawCircleEnd = (event: MouseEvent) => {
		if (!circleStartPosition.value) return;

		const newCircleEndPosition = getMousePosition(event);

		if (
			!newCircleEndPosition ||
			(newCircleEndPosition.x === circleEndPosition.value?.x &&
				newCircleEndPosition.y === circleEndPosition.value?.y)
		) {
			return;
		}

		circleEndPosition.value = newCircleEndPosition;
		drawCircle("preview");
	};

	const drawCircle = (canvasType: CanvasType) => {
		if (!circleStartPosition.value || !circleEndPosition.value) {
			return;
		}

		canvasStore.drawCircle({
			canvasType,
			circleStartPosition: { ...circleStartPosition.value },
			circleEndPosition: { ...circleEndPosition.value },
		});
	};
}
