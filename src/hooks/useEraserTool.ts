import { useCanvasStore, useConfigStore } from "@/store";
import { type Position, ToolTypeEnum } from "@/types";
import { storeToRefs } from "pinia";
import { type Subscription, merge, tap } from "rxjs";
import { ref, watch } from "vue";
import { useHoverPixel } from "./useHover";
import { useToolsCommon } from "./useToolsCommon";

export function useEraserTool() {
	const isErasing = ref(false);
	const erase$ = ref<Subscription>();
	const prePosition = ref<Position | null>(null);

	const configTool = useConfigStore();
	const canvasStore = useCanvasStore();
	const { getMousePosition, eraseLineIfPointsDisconnected } = useToolsCommon();
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
					const position = getMousePosition(event);
					if (!position) return;

					isErasing.value = true;
					prePosition.value = position;
					erasePixel(position);
				}),
			),
			mouseMove$.pipe(
				tap((event: MouseEvent) => {
					if (isErasing.value) {
						const position = getMousePosition(event);
						if (!position) return;

						erasePixel(position);
						eraseLineIfPointsDisconnected(position, prePosition.value);
						prePosition.value = position;
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

	const erasePixel = (position: Position | null) => {
		if (!position) return;

		canvasStore.clearRect({
			position,
			canvasType: "main",
		});
	};
}
