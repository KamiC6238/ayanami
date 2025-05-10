<script setup lang="ts">
import Download from "@/assets/icons/downloads.png";
import { useCanvasStore } from "@/store";
import { ExportTypeEnum } from "@/types";
import { save } from "@/utils";
import { ref, watch } from "vue";
import Dialog from "./Dialog.vue";
import { PixelBorderUltimate } from "./PixelBorder";

const exportOptions = [
	{
		exportType: ExportTypeEnum.PNG,
		text: "as PNG",
	},
	{
		exportType: ExportTypeEnum.Source,
		text: "as Ayanami",
	},
];

const visible = ref(false);
const hoverIndex = ref(-1);
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
      height='h-[120px]'
      @close='visible = false'
    >
      <div
        v-for='({ exportType, text }, index) of exportOptions'
        :key='index'
        class='flex items-center justify-between text-[12px] leading-6 cursor-pointer'
        @click='() => canvasStore.exportFile(exportType)'
        @mouseover='hoverIndex = index'
        @mouseleave='hoverIndex = -1'
      >
        <span>{{ text }}</span>
        <span
          v-show='hoverIndex === index'
          class='text-[#ffd700]'
          >*</span>
      </div>
    </Dialog>
  </div>
</template>