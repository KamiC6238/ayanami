<script setup lang="ts">
import Download from "@/assets/icons/downloads.png";
import { useCanvasStore } from "@/store";
import { ExportTypeEnum } from "@/types";
import { save } from "@/utils";
import { ref, watch } from "vue";
import Dialog from "./Dialog.vue";
import { PixelBorderUltimate } from "./PixelBorder";

const visible = ref(false);

const canvasStore = useCanvasStore();

watch(
	() => canvasStore.canvasWorker,
	(worker) => {
		if (!worker) return;

		worker.onmessage = (e) => {
			const { type, payload } = e.data;
			if (type !== "export") return;
			const { blob, exportType } = payload;

			save(blob, {
				filename: canvasStore.currentTabId,
				exportType,
			});
		};
	},
);
</script>
<template>
  <div class='flex flex-1 flex-col mb-5 justify-end'>
    <PixelBorderUltimate @click='visible = true'>
      <img :src='Download' class='w-6 h-6 p-1' />
    </PixelBorderUltimate>
    <Dialog
      :visible
      title='Save'
      width='w-[260px]'
      height='h-[130px]'
      @close='visible = false'
    >
      <div
        class='text-[12px] leading-6 cursor-pointer mb-2'
        @click='() => canvasStore.exportFile(ExportTypeEnum.PNG)'
      >Save as PNG
      </div>
      <div
        class='text-[12px] leading-6 cursor-pointer'
        @click='() => canvasStore.exportFile(ExportTypeEnum.Source)'
      >Save as Ayanami</div>
    </Dialog>
  </div>
</template>