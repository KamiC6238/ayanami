import { useCanvasStore, useConfigStore } from "@/store";
import { ToolTypeEnum } from "@/types";
import { getPixelPosition } from "@/utils";
import { storeToRefs } from "pinia";
import { type Subscription, merge, tap } from "rxjs";
import { ref, watch } from "vue";
import { useHoverPixel } from "./useHover";

export function useEraserTool() {
	const isErasing = ref(false);
	const erase$ = ref<Subscription>();

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
					isErasing.value = true;
					erasePixel(event);
				}),
			),
			mouseMove$.pipe(
				tap((event: MouseEvent) => {
					if (isErasing.value) {
						erasePixel(event);
					}
					drawHoverPixel(event);
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

	const erasePixel = (event: MouseEvent) => {
		const canvas = canvasStore.getCanvas("preview");

		if (canvas) {
			canvasStore.clearRect({
				position: getPixelPosition(canvas, event),
				canvasType: "main",
			});
		}
	};
}
