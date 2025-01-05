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
	const { mouseDown$, mouseLeave$, mouseMove$, mouseUp$, globalMouseUp$ } =
		storeToRefs(canvasStore);

	watch(toolType, (type) => {
		if (type === ToolTypeEnum.Eraser) {
			initEraser();
		} else {
			disposeEraser();
		}
	});

	const disposeEraser = () => erase$.value?.unsubscribe();

	const initEraser = () => {
		if (
			!mouseDown$.value ||
			!mouseMove$.value ||
			!mouseUp$.value ||
			!mouseLeave$.value
		) {
			return;
		}

		erase$.value = merge(
			mouseDown$.value.pipe(
				tap((event: MouseEvent) => {
					isErasing.value = true;
					erasePixel(event);
				}),
			),
			mouseMove$.value.pipe(
				tap((event: MouseEvent) => {
					if (isErasing.value) {
						erasePixel(event);
					}
					drawHoverPixel(event);
				}),
			),
			mouseUp$.value.pipe(
				tap(() => {
					isErasing.value = false;
				}),
			),
			mouseLeave$.value.pipe(tap(() => setHoveredPixel(null))),
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
