import { useCanvasStore, useConfigStore } from "@/store";
import { ToolTypeEnum } from "@/types";
import { type Subscription, filter, fromEvent } from "rxjs";
import { onBeforeMount, onMounted, ref } from "vue";

const getIsUndoOrRedo = (e: KeyboardEvent) => {
	const _ = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z";

	return {
		isUndo: _ && !e.shiftKey,
		isRedo: _ && e.shiftKey,
	};
};

const isEllipsisCircle = (e: KeyboardEvent) => {
	return e.key.toLowerCase() === "c" && e.shiftKey;
};

export function useShortcuts() {
	const shortcuts$ = ref<Subscription | null>(null);

	const canvasStore = useCanvasStore();
	const configStore = useConfigStore();

	onMounted(() => {
		const keydown$ = fromEvent<KeyboardEvent>(window, "keydown");

		shortcuts$.value = keydown$
			.pipe(
				filter((e) => {
					const { isUndo, isRedo } = getIsUndoOrRedo(e);
					return (
						isUndo ||
						isRedo ||
						isEllipsisCircle(e) ||
						["p", "e", "b", "l", "s", "c"].includes(e.key.toLowerCase())
					);
				}),
			)
			.subscribe((e) => {
				e.preventDefault();

				const { isUndo, isRedo } = getIsUndoOrRedo(e);

				if (isUndo) {
					return canvasStore.undo();
				}

				if (isRedo) {
					return canvasStore.redo();
				}

				if (isEllipsisCircle(e)) {
					return configStore.setToolType(ToolTypeEnum.Ellipse);
				}

				switch (e.key.toLowerCase()) {
					case "p":
						return configStore.setToolType(ToolTypeEnum.Pencil);
					case "e":
						return configStore.setToolType(ToolTypeEnum.Eraser);
					case "b":
						return configStore.setToolType(ToolTypeEnum.Bucket);
					case "l":
						return configStore.setToolType(ToolTypeEnum.Line);
					case "s":
						return configStore.setToolType(ToolTypeEnum.Square);
					case "c":
						return configStore.setToolType(ToolTypeEnum.Circle);
				}
			});
	});

	onBeforeMount(() => shortcuts$.value?.unsubscribe());
}
