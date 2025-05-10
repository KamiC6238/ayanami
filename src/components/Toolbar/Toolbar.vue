<script setup lang="ts">
import { STORAGE_KEY_FOR_LAST_USED_TOOL } from "@/constants";
import {
	useBucketTool,
	useCircleTool,
	useEraserTool,
	useLineTool,
	usePencilTool,
	useShortcuts,
	useSquareTool,
} from "@/hooks";
import { useCanvasStore, useConfigStore } from "@/store";
import { ToolTypeEnum } from "@/types";
import { useLocalStorage } from "@vueuse/core";
import { onMounted } from "vue";
import ImportExport from "../ImportExport.vue";
import { PixelBorderUltimate } from "../PixelBorder";
import tools from "./tools";

const configStore = useConfigStore();
const canvasStore = useCanvasStore();
const storage = useLocalStorage(
	STORAGE_KEY_FOR_LAST_USED_TOOL,
	ToolTypeEnum.Pencil,
);

useCircleTool();
usePencilTool();
useEraserTool();
useLineTool();
useSquareTool();
useBucketTool();
useShortcuts();

onMounted(() => {
	configStore.setToolType(storage.value as ToolTypeEnum);
});

const toolHandler = (type: ToolTypeEnum) => {
	if (type === ToolTypeEnum.Broom) {
		canvasStore.clearAllPixels("main");
		canvasStore.record({ toolType: ToolTypeEnum.Broom });
	} else {
		configStore.setToolType(type);
		storage.value = type;
	}
};
</script>
<template>
  <div class='flex flex-col w-full basis-[40px] items-center ml-[3px]'>
    <PixelBorderUltimate
      v-for="(item, index) of tools" :key='index'
      :active='item.type === configStore.toolType'
    >
      <img
        :src="item.url"
        class='w-6 h-6 p-1'
        @click="() => toolHandler(item.type)"
      />
    </PixelBorderUltimate>
    <ImportExport />
  </div>
</template>