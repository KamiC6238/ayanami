<script setup lang="ts">
import { useFramesStore } from "@/store";
import { useCanvasStore } from "@/store";
import { ExportTypeEnum } from "@/types";
import { save } from "@/utils";
import GIF from "gif.js";
import { ref } from "vue";
import Dialog from "../Dialog.vue";
import FpsRange from "../Toolbar/FpsRange.vue";

interface Props {
	visible: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
	(e: "close"): void;
	(e: "export"): void;
}>();

const loop = ref(false);
const framesStore = useFramesStore();
const canvasStore = useCanvasStore();

const onClose = () => {
	emit("close");
};

const onExport = async () => {
	emit("export");

	const canvas = canvasStore.getCanvas("main");
	if (!canvas) return;

	const gif = new GIF({
		workerScript: new URL("@/worker/gif.worker.js", import.meta.url).toString(),
		width: canvas.width,
		height: canvas.height,
		repeat: loop.value ? 0 : -1,
		transparent: "#00FF00",
	});

	const imgElements = Array.from(document.querySelectorAll("img")).filter(
		(imgElement) => imgElement.id.startsWith("frame-"),
	);

	for (const img of imgElements) {
		gif.addFrame(img, {
			delay: framesStore.frameDuration,
		});
	}

	gif.on("finished", (blob) => {
		save(blob, {
			filename: canvasStore.currentTabId,
			exportType: ExportTypeEnum.GIF,
		});
	});

	gif.render();
};
</script>
<template>
  <Dialog
    :visible='visible'
    title='Gif config'
    width='w-[260px]'
    height='h-[180px]'
    @close='onClose'
  >
    <div class='flex flex-col gap-2'>
      <div>
        <input type="checkbox" id="loop" name="loop" v-model='loop' />
        <label for="loop" class='text-[12px] ml-2 cursor-pointer'>Loop</label>
      </div>
      <FpsRange class='!ml-0' />
    </div>
    <footer class='flex justify-end gap-2 mt-2'>
      <button class='text-[10px] cursor-pointer' @click='onClose'>Cancel</button>
      <button class='text-[10px] cursor-pointer' @click='onExport'>Export</button>
    </footer>
  </Dialog>
</template>