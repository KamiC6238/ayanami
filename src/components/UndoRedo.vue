<script setup lang="ts">
import RedoIcon from "@/assets/icons/redo.svg";
import UndoIcon from "@/assets/icons/undo.svg";
import { useCanvasStore } from "@/store";
import { type Subscription, filter, fromEvent, tap } from "rxjs";
import { onBeforeMount, onMounted, ref } from "vue";
import { PixelBorderUltimate } from "./PixelBorder";

const undo$ = ref<Subscription | null>(null);
const redo$ = ref<Subscription | null>(null);

const canvasStore = useCanvasStore();

onMounted(() => {
	undo$.value = fromEvent<KeyboardEvent>(window, "keydown")
		.pipe(
			filter(
				(event) =>
					(event.ctrlKey || event.metaKey) &&
					!event.shiftKey &&
					event.key.toLowerCase() === "z",
			),
			tap((event) => {
				event.preventDefault();
				canvasStore.undo();
			}),
		)
		.subscribe();

	redo$.value = fromEvent<KeyboardEvent>(window, "keydown")
		.pipe(
			filter(
				(event) =>
					(event.ctrlKey || event.metaKey) &&
					event.shiftKey &&
					event.key.toLowerCase() === "z",
			),
			tap((event) => {
				event.preventDefault();
				canvasStore.redo();
			}),
		)
		.subscribe();
});

onBeforeMount(() => {
	undo$.value?.unsubscribe();
	redo$.value?.unsubscribe();
});
</script>
<template>
  <div class="flex absolute bottom-2 right-2 gap-2">
    <PixelBorderUltimate @click='canvasStore.undo'>
      <UndoIcon class='w-6 h-6 p-1' />
    </PixelBorderUltimate>
    <PixelBorderUltimate @click='canvasStore.redo'>
      <RedoIcon class='w-6 h-6 p-1' />
    </PixelBorderUltimate>
  </div>
</template>