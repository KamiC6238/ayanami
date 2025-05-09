<script setup lang="ts">
import Download from "@/assets/icons/downloads.png";
import { useCanvasStore } from "@/store";
import { ExportTypeEnum } from "@/types";
import { save } from "@/utils";
import { watch } from "vue";
import { PixelBorderUltimate } from "./PixelBorder";

const canvasStore = useCanvasStore();

watch(
	() => canvasStore.canvasWorker,
	(worker) => {
		if (!worker) return;

		worker.onmessage = (e) => {
			const { type, payload } = e.data;
			if (type !== "export") return;
			save(payload.blob, canvasStore.currentTabId);
		};
	},
);
</script>
<template>
  <div class='flex flex-1 flex-col mb-5 justify-end'>
    <PixelBorderUltimate @click='() => canvasStore.exportFile(ExportTypeEnum.Source)'>
      <img :src='Download' class='w-6 h-6 p-1' />
    </PixelBorderUltimate>
  </div>
</template>