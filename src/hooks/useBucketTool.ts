import { useCanvasStore, useConfigStore } from "@/store";
import { ToolTypeEnum } from "@/types";
import { storeToRefs } from "pinia";
import { type Subscription, merge, tap } from "rxjs";
import { ref, watch } from "vue";
import { useHoverPixel } from "./useHover";

export function useBucketTool() {
	const bucket$ = ref<Subscription>();

	const configTool = useConfigStore();
	const canvasStore = useCanvasStore();
	const { drawHoverPixel } = useHoverPixel();

	const { toolType } = storeToRefs(configTool);
	const { mouse$ } = storeToRefs(canvasStore);

	watch(toolType, (type) => {
		if (type === ToolTypeEnum.Bucket) {
			initBucket();
		} else {
			disposeBucket();
		}
	});

	const disposeBucket = () => bucket$.value?.unsubscribe();

	const initBucket = () => {
		const { mouseDown$, mouseMove$ } = mouse$.value;

		if (!mouseDown$ || !mouseMove$) return;

		bucket$.value = merge(
			mouseDown$.pipe(
				tap((event: MouseEvent) => {
					canvasStore.fillBucket();
				}),
			),
			mouseMove$.pipe(tap((event: MouseEvent) => drawHoverPixel(event))),
		).subscribe();
	};
}
