import { useCanvasStore, useConfigStore, useRecordsStore } from "@/store";
import { type PencilRecord, type Position, ToolTypeEnum } from "@/types";
import { getPixelPosition } from "@/utils";
import { storeToRefs } from "pinia";
import { type Subscription, merge, tap } from "rxjs";
import { computed, ref, watch } from "vue";
import { useHoverPixel } from "./useHover";

export function usePencilTool() {
	const isDrawing = ref(false);
	const draw$ = ref<Subscription>();
	const recordPoints = ref<[number, number, number][]>([]);

	const recordStore = useRecordsStore();
	const configTool = useConfigStore();
	const canvasStore = useCanvasStore();
	const { drawHoverPixel, setHoveredPixel } = useHoverPixel();

	const { toolType, pixelColor, pixelSize } = storeToRefs(configTool);
	const { mouse$, globalMouseUp$ } = storeToRefs(canvasStore);

	watch(toolType, (type) => {
		if (type === ToolTypeEnum.Pencil) {
			initPencil();
		} else {
			disposePencil();
		}
	});

	const pencilRecord = computed<PencilRecord>(() => {
		return [
			toolType.value,
			pixelColor.value,
			pixelSize.value,
			recordPoints.value,
		];
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
					recordStore.setRecord(pencilRecord.value);
					recordPoints.value = [];
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

	const updateDrawPoints = (position: Position) => {
		let saveAsNewPoint = true;
		recordPoints.value = [...recordPoints.value].map((point) => {
			const [x, y, drawCounts] = point;

			if (position.x === x && position.y === y) {
				saveAsNewPoint = false;
				return [x, y, drawCounts + 1];
			}
			return point;
		});

		if (saveAsNewPoint) {
			recordPoints.value.push([position.x, position.y, 1]);
		}
	};

	const drawPixel = (event: MouseEvent) => {
		const canvas = canvasStore.getCanvas("preview");

		if (canvas) {
			const position = getPixelPosition(canvas, event);

			canvasStore.fillRect({
				position,
				canvasType: "main",
			});

			updateDrawPoints(position);
		}
	};
}
