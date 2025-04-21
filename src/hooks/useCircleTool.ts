import { useCanvasStore, useConfigStore } from "@/store";
import { type CanvasType, type Position, ToolTypeEnum } from "@/types";
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

	const configStore = useConfigStore();
	const canvasStore = useCanvasStore();
	const { drawHoverPixel, setHoveredPixel } = useHoverPixel();

	const { toolType } = storeToRefs(configStore);
	const { mouse$, globalMouseUp$ } = storeToRefs(canvasStore);

	watch(toolType, (type) => {
		if (type === ToolTypeEnum.Circle) {
			initCircle();
		} else {
			disposeCircle();
		}
	});

	const disposeCircle = () => circle$.value?.unsubscribe();

	const initCircle = () => {
		const { mouseDown$, mouseMove$, mouseUp$, mouseLeave$ } = mouse$.value;

		if (!mouseDown$ || !mouseMove$ || !mouseUp$ || !mouseLeave$) {
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
			const newCircleEndPosition = getPixelPosition(canvas, event);

			if (
				newCircleEndPosition.x === circleEndPosition.value?.x &&
				newCircleEndPosition.y === circleEndPosition.value?.y
			) {
				return;
			}

			circleEndPosition.value = newCircleEndPosition;
			drawCircle("preview");
		}
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
