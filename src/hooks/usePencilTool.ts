import { DEFAULT_PIXEL_SIZE } from "@/constants";
import { useCanvasStore, useConfigStore } from "@/store";
import { type Position, ToolTypeEnum } from "@/types";
import { getPixelPosition } from "@/utils";
import { storeToRefs } from "pinia";
import { type Subscription, merge, tap } from "rxjs";
import { ref, watch } from "vue";
import { useHoverPixel } from "./useHover";

export function usePencilTool() {
	const isDrawing = ref(false);
	const draw$ = ref<Subscription>();
	const prePosition = ref<Position | null>(null);

	const configTool = useConfigStore();
	const canvasStore = useCanvasStore();
	const { drawHoverPixel, setHoveredPixel } = useHoverPixel();

	const { toolType } = storeToRefs(configTool);
	const { mouse$, globalMouseUp$ } = storeToRefs(canvasStore);

	watch(toolType, (type) => {
		if (type === ToolTypeEnum.Pencil) {
			initPencil();
		} else {
			disposePencil();
		}
	});

	const disposePencil = () => draw$.value?.unsubscribe();

	const initPencil = () => {
		const { mouseDown$, mouseMove$, mouseUp$, mouseLeave$ } = mouse$.value;

		if (!mouseDown$ || !mouseMove$ || !mouseUp$ || !mouseLeave$) {
			return;
		}

		draw$.value = merge(
			mouseDown$.pipe(
				tap((event: MouseEvent) => {
					const canvas = canvasStore.getCanvas("preview");
					if (!canvas) return;

					const position = getPixelPosition(canvas, event);
					isDrawing.value = true;
					drawPixel(position);
					prePosition.value = position;
				}),
			),
			mouseMove$.pipe(
				tap((event: MouseEvent) => {
					if (isDrawing.value) {
						const canvas = canvasStore.getCanvas("preview");
						if (!canvas) return;

						const position = getPixelPosition(canvas, event);
						drawPixel(position);
						drawLineIfPointsDisconnected(position);
					} else {
						drawHoverPixel(event);
					}
				}),
			),
			mouseUp$.pipe(
				tap(() => {
					isDrawing.value = false;
					canvasStore.record();
				}),
			),
			mouseLeave$.pipe(tap(() => setHoveredPixel(null))),
			globalMouseUp$.value.pipe(
				tap(() => {
					isDrawing.value = false;
				}),
			),
		).subscribe();
	};

	const drawLineIfPointsDisconnected = (position: Position | null) => {
		if (!position || !prePosition.value) return;

		const { x: curX, y: curY } = position;
		const { x: preX, y: preY } = prePosition.value;

		if (
			Math.abs(curX - preX) > DEFAULT_PIXEL_SIZE ||
			Math.abs(curY - preY) > DEFAULT_PIXEL_SIZE
		) {
			canvasStore.drawLine({
				toolType: ToolTypeEnum.Pencil,
				canvasType: "main",
				lineStartPosition: { ...position },
				lineEndPosition: { ...prePosition.value },
			});
		}

		prePosition.value = position;
	};

	const drawPixel = (position: Position | null) => {
		if (!position) return;

		canvasStore.fillRect({
			position,
			canvasType: "main",
		});
	};
}
