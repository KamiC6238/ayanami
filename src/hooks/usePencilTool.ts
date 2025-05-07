import { useCanvasStore, useConfigStore } from "@/store";
import { type Position, ToolTypeEnum } from "@/types";
import { storeToRefs } from "pinia";
import { type Subscription, merge, tap } from "rxjs";
import { ref, watch } from "vue";
import { useHoverPixel } from "./useHover";
import { useToolsCommon } from "./useToolsCommon";

export function usePencilTool() {
	const isDrawing = ref(false);
	const draw$ = ref<Subscription>();
	const prePosition = ref<Position | null>(null);

	const configTool = useConfigStore();
	const canvasStore = useCanvasStore();
	const { getMousePosition, drawLineIfPointsDisconnected } = useToolsCommon();
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
					const position = getMousePosition(event);
					if (!position) return;

					isDrawing.value = true;
					prePosition.value = position;
					drawPixel(position);
				}),
			),
			mouseMove$.pipe(
				tap((event: MouseEvent) => {
					if (isDrawing.value) {
						const position = getMousePosition(event);
						if (!position) return;

						drawPixel(position);
						drawLineIfPointsDisconnected(position, prePosition.value);
						prePosition.value = position;
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

	const drawPixel = (position: Position | null) => {
		if (!position) return;

		canvasStore.fillRect({
			position,
			canvasType: "main",
		});
	};
}
