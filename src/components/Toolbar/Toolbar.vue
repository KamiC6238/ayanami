<script setup lang="ts">
import BroomIconSrc from "@/assets/icons/broom.png";
import BucketIconSrc from "@/assets/icons/bucket.png";
import CircleIconSrc from "@/assets/icons/circle.png";
import EllipsisCircleIconSrc from "@/assets/icons/ellipsis.png";
import EraserIconSrc from "@/assets/icons/eraser.png";
import LineIconSrc from "@/assets/icons/line.png";
import PencilIconSrc from "@/assets/icons/pencil.png";
import SquareIconSrc from "@/assets/icons/square.png";
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
import Export from "../Export.vue";
import { PixelBorderUltimate } from "../PixelBorder";

const tools = [
	{
		url: PencilIconSrc,
		type: ToolTypeEnum.Pencil,
	},
	{
		url: EraserIconSrc,
		type: ToolTypeEnum.Eraser,
	},
	{
		url: BucketIconSrc,
		type: ToolTypeEnum.Bucket,
	},
	{
		url: LineIconSrc,
		type: ToolTypeEnum.Line,
	},
	{
		url: CircleIconSrc,
		type: ToolTypeEnum.Circle,
	},
	{
		url: EllipsisCircleIconSrc,
		type: ToolTypeEnum.Ellipse,
	},
	{
		url: SquareIconSrc,
		type: ToolTypeEnum.Square,
	},
	{
		url: BroomIconSrc,
		type: ToolTypeEnum.Broom,
	},
];

const configStore = useConfigStore();
const canvasStore = useCanvasStore();

useCircleTool();
usePencilTool();
useEraserTool();
useLineTool();
useSquareTool();
useBucketTool();
useShortcuts();

const toolHandler = (type: ToolTypeEnum) => {
	type === ToolTypeEnum.Broom
		? canvasStore.clearAllPixels("main")
		: configStore.setToolType(type);
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
    <Export />
  </div>
</template>