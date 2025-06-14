<script setup lang="ts">
import Download from "@/assets/icons/download.svg";
import { useCanvasStore } from "@/store";
import { ExportTypeEnum } from "@/types";
import { save } from "@/utils";
import { ref, useTemplateRef, watch } from "vue";
import Dialog from "../Dialog.vue";
import { PixelBorderUltimate } from "../PixelBorder";
import GifConfigDialog from "./GifDialog.vue";

const exportOptions = [
	{
		exportType: ExportTypeEnum.PNG,
		text: "as PNG",
	},
	{
		exportType: ExportTypeEnum.GIF,
		text: "as GIF",
	},
	{
		exportType: ExportTypeEnum.Source,
		text: "as Ayanami",
	},
];

const visible = ref(false);
const gifConfigDialogVisible = ref(false);
const hoverIndex = ref(-1);
const exportDialogRef = useTemplateRef("exportDialog");

const canvasStore = useCanvasStore();

watch(
	() => canvasStore.canvasWorker,
	(worker) => {
		if (!worker) return;

		worker.addEventListener("message", (e) => {
			const { type, payload } = e.data;
			if (type !== "export") return;
			const { blob, exportType } = payload;

			save(blob, {
				filename: canvasStore.currentTabId,
				exportType,
			});
		});
	},
);

const onExport = (exportType: ExportTypeEnum) => {
	canvasStore.exportFile(exportType);
	visible.value = false;
};

const onExportClick = (exportType: ExportTypeEnum) => {
	if (exportType === ExportTypeEnum.GIF) {
		gifConfigDialogVisible.value = true;
	} else {
		onExport(exportType);
	}
};

const onGifConfigDialogClose = () => {
	gifConfigDialogVisible.value = false;
	visible.value = true;
	exportDialogRef.value?.focus();
};

const onGifExport = () => {
	gifConfigDialogVisible.value = false;
	visible.value = false;
};
</script>
<template>
  <PixelBorderUltimate @click='visible = true'>
    <Download class='w-6 h-6 p-1' />
  </PixelBorderUltimate>
  <Dialog
    ref='exportDialog'
    :visible
    title='Save'
    width='w-[260px]'
    height='h-[140px]'
    @close='visible = false'
  >
    <div
      v-for='({ exportType, text }, index) of exportOptions'
      :key='index'
      class='flex items-center justify-between text-[12px] leading-6 cursor-pointer mb-1'
      @click='() => onExportClick(exportType)'
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
  <GifConfigDialog
    ref='gifConfigDialog'
    :visible='gifConfigDialogVisible'
    @close='onGifConfigDialogClose'
    @export='onGifExport'
  />
</template>