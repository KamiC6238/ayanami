<script setup lang="ts">
import { DEFAULT_PIXEL_SIZE } from "@/constants";
import {
	useBucketTool,
	useCircleTool,
	useEraserTool,
	useLineTool,
	usePencilTool,
	useSquareTool,
} from "@/hooks";
import { useCanvasStore, useConfigStore } from "@/store";
import { CircleTypeEnum, ToolTypeEnum } from "@/types";

const tools = [
	ToolTypeEnum.Pencil,
	ToolTypeEnum.Eraser,
	ToolTypeEnum.Bucket,
	ToolTypeEnum.Line,
	ToolTypeEnum.Square,
	ToolTypeEnum.Circle,
];
const perfectCircle = CircleTypeEnum.Circle;
const ellipseCircle = CircleTypeEnum.Ellipse;

const configStore = useConfigStore();
const { clearAllPixels } = useCanvasStore();

useCircleTool();
usePencilTool();
useEraserTool();
useLineTool();
useSquareTool();
useBucketTool();

const onPixelSizeChange = (e: Event) => {
	configStore.setPixelSize(Number((e.target as HTMLInputElement).value));
};

const onCircleTypeChange = (e: Event) => {
	if (e.target) {
		const target = e.target as HTMLSelectElement;
		configStore.setCircleType(target.value as CircleTypeEnum);
	}
};
</script>
<template>
  <div>
    <div class='flex flex-col w-full'>
      <button
        v-for="toolType of tools"
        style='margin-bottom: 10px;'
        @click="() => configStore.setToolType(toolType)"
      >
        {{ toolType.slice(0, 1) }}
      </button>
      <!-- <select :value="perfectCircle" @change="onCircleTypeChange" style='margin-bottom: 10px;'>
        <option :value="perfectCircle">圆形</option>
        <option :value="ellipseCircle">椭圆</option>
      </select>
      <button style="margin-bottom: 10px" @click="() => clearAllPixels('main')">clear</button> -->
    </div>
    <!-- <div style="display: flex; flex-direction: column; margin-top: 10px; width: 100px; font-size: 12px;" >
      <span>pixel size {{ configStore.pixelSize }}: </span>
      <input
        type="range"
        id='pixelSize'
        :min="DEFAULT_PIXEL_SIZE"
        max="100"
        :value="configStore.pixelSize"
        :step="DEFAULT_PIXEL_SIZE"
        @input="onPixelSizeChange"
      />
    </div> -->
  </div>
</template>