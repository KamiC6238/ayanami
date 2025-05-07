import { DEFAULT_PIXEL_SIZE } from "@/constants";
import { useCanvasStore, useConfigStore } from "@/store";
import { type Position, ToolTypeEnum } from "@/types";
import { getPixelPosition } from "@/utils";
import { storeToRefs } from "pinia";
import { type Subscription, merge, tap } from "rxjs";
import { ref, watch } from "vue";
import { useHoverPixel } from "./useHover";

export function useEraserTool() {
	const isErasing = ref(false);
	const erase$ = ref<Subscription>();
	const prePosition = ref<Position | null>(null);

	const configTool = useConfigStore();
	const canvasStore = useCanvasStore();
	const { drawHoverPixel, setHoveredPixel } = useHoverPixel();

	const { toolType } = storeToRefs(configTool);
	const { mouse$, globalMouseUp$ } = storeToRefs(canvasStore);

	watch(toolType, (type) => {
		if (type === ToolTypeEnum.Eraser) {
			initEraser();
		} else {
			disposeEraser();
		}
	});

	const disposeEraser = () => erase$.value?.unsubscribe();

	const initEraser = () => {
		const { mouseDown$, mouseMove$, mouseUp$, mouseLeave$ } = mouse$.value;

		if (!mouseDown$ || !mouseMove$ || !mouseUp$ || !mouseLeave$) {
			return;
		}

		erase$.value = merge(
			mouseDown$.pipe(
				tap((event: MouseEvent) => {
					const canvas = canvasStore.getCanvas("preview");
					if (!canvas) return;

					const position = getPixelPosition(canvas, event);
					isErasing.value = true;
					erasePixel(position);
					prePosition.value = position;
				}),
			),
			mouseMove$.pipe(
				tap((event: MouseEvent) => {
					if (isErasing.value) {
						const canvas = canvasStore.getCanvas("preview");
						if (!canvas) return;

						const position = getPixelPosition(canvas, event);
						erasePixel(position);
						eraseLineIfPointsDisconnected(position);
					} else {
						drawHoverPixel(event);
					}
				}),
			),
			mouseUp$.pipe(
				tap(() => {
					isErasing.value = false;
					canvasStore.record();
				}),
			),
			mouseLeave$.pipe(tap(() => setHoveredPixel(null))),
			globalMouseUp$.value.pipe(
				tap(() => {
					isErasing.value = false;
				}),
			),
		).subscribe();
	};

	const eraseLineIfPointsDisconnected = (position: Position | null) => {
		if (!position || !prePosition.value) return;

		const { x: curX, y: curY } = position;
		const { x: preX, y: preY } = prePosition.value;

		if (
			Math.abs(curX - preX) > DEFAULT_PIXEL_SIZE ||
			Math.abs(curY - preY) > DEFAULT_PIXEL_SIZE
		) {
			canvasStore.drawLine({
				toolType: ToolTypeEnum.Eraser,
				canvasType: "main",
				lineStartPosition: { ...position },
				lineEndPosition: { ...prePosition.value },
			});
		}

		prePosition.value = position;
	};

	const erasePixel = (position: Position | null) => {
		if (!position) return;

		canvasStore.clearRect({
			position,
			canvasType: "main",
		});
	};
}
