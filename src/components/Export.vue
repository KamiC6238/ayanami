<script setup lang="ts">
import { useCanvasStore } from "@/store";
import { ExportTypeEnum } from "@/types";
import { saveAsPNG } from "@/utils";
import { watch } from "vue";

const canvasStore = useCanvasStore();

watch(
	() => canvasStore.canvasWorker,
	(worker) => {
		if (!worker) return;

		worker.onmessage = (e) => {
			const { type, payload } = e.data;
			if (type !== "export") return;

			const { exportType, blob } = payload;

			switch (exportType) {
				case ExportTypeEnum.PNG:
					saveAsPNG(blob, canvasStore.currentTabId);
					break;
			}
		};
	},
);
</script>
<template>
  <div @click='canvasStore.exportToPNG'>export</div>
</template>