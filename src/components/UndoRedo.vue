<script setup lang="ts">
import RedoIcon from "@/assets/icons/redo.svg";
import UndoIcon from "@/assets/icons/undo.svg";
import { useCanvasStore } from "@/store";
import { type Subscription, fromEvent, tap } from "rxjs";
import { onBeforeMount, onMounted, ref } from "vue";
import { PixelBorderUltimate } from "./PixelBorder";

const undoAndRedo$ = ref<Subscription | null>(null);

const canvasStore = useCanvasStore();

onMounted(() => {
	undoAndRedo$.value = fromEvent<KeyboardEvent>(window, "keydown")
		.pipe(
			tap((event) => {
				event.preventDefault();

				const _ =
					(event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z";
				const isUndo = _ && !event.shiftKey;
				const isRedo = _ && event.shiftKey;

				isUndo && canvasStore.undo();
				isRedo && canvasStore.redo();
			}),
		)
		.subscribe();
});

onBeforeMount(() => undoAndRedo$.value?.unsubscribe());
</script>
<template>
  <div class="flex absolute bottom-2 right-2 gap-2">
    <PixelBorderUltimate @click='canvasStore.undo'>
      <UndoIcon class='w-6 h-6' />
    </PixelBorderUltimate>
    <PixelBorderUltimate @click='canvasStore.redo'>
      <RedoIcon class='w-6 h-6' />
    </PixelBorderUltimate>
  </div>
</template>