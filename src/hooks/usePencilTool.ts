import { useCanvasStore, useConfigStore, useRecordsStore } from "@/store";
import { ToolTypeEnum } from "@/types";
import { getPixelPosition } from "@/utils";
import { storeToRefs } from "pinia";
import { type Subscription, merge, tap } from "rxjs";
import { ref, watch } from "vue";
import { useHoverPixel } from "./useHover";

export function usePencilTool() {
	const isDrawing = ref(false);
	const draw$ = ref<Subscription>();

	const recrodStore = useRecordsStore();
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
					isDrawing.value = true;
					drawPixel(event);
				}),
			),
			mouseMove$.pipe(
				tap((event: MouseEvent) => {
					if (isDrawing.value) {
						drawPixel(event);
					} else {
						drawHoverPixel(event);
					}
				}),
			),
			mouseUp$.pipe(
				tap(() => {
					isDrawing.value = false;
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

	const drawPixel = (event: MouseEvent) => {
		const canvas = canvasStore.getCanvas("preview");

		if (canvas) {
			const position = getPixelPosition(canvas, event);

			canvasStore.fillRect({
				position,
				canvasType: "main",
			});
			recrodStore.setRecord({ position });
		}
	};
}
