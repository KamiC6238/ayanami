<script setup lang="ts">
import Upload from "@/assets/icons/upload.svg";
import { useCanvasStore } from "@/store";
import { useTemplateRef } from "vue";
import { PixelBorderUltimate } from "../PixelBorder";

const canvasStore = useCanvasStore();
const uploadRef = useTemplateRef("upload");

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

const onUpload = () => {
	// @ts-ignore
	uploadRef.value?.click();
};
</script>

<template>
<PixelBorderUltimate>
  <Upload
    class='w-6 h-6 p-1'
    @click='onUpload'
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
</template>