<script setup lang="ts">
import Download from "@/assets/icons/download.svg";
import Upload from "@/assets/icons/upload.svg";
import { useCanvasStore } from "@/store";
import { ExportTypeEnum } from "@/types";
import { save } from "@/utils";
import { ref, useTemplateRef, watch } from "vue";
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
const uploadRef = useTemplateRef("upload");

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

const onFileChange = (e: Event) => {
	const target = e?.target as HTMLInputElement;
	const file = target.files?.[0];
	if (!file) return;

	canvasStore.importFile(file);
	/**
	 * why do this?
	 * because if we don't do this, the same file will not be selected again
	 */
	target.value = "";
};

const upload = () => {
	// @ts-ignore
	uploadRef.value?.click();
};

const onExport = (exportType: ExportTypeEnum) => {
	canvasStore.exportFile(exportType);
	visible.value = false;
};
</script>
<template>
  <div class='flex flex-1 flex-col mb-5 justify-end'>
    <PixelBorderUltimate>
      <Upload
        class='w-6 h-6 p-1'
        @click='upload'
      />
      <input
        ref='upload'
        class='hidden'
        type="file"
        id="upload"
        name="upload"
        accept=".ayanami"
        @change='onFileChange'
      />
    </PixelBorderUltimate>
    <PixelBorderUltimate @click='visible = true'>
      <Download class='w-6 h-6 p-1' />
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
        @click='() => onExport(exportType)'
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