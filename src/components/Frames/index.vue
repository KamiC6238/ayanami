<script setup lang="ts">
import ActiveFrameIcon from "@/assets/icons/active-frame.svg";
import PlayNextIcon from "@/assets/icons/play-next.svg";
import PlayPrevIcon from "@/assets/icons/play-prev.svg";
import PlayIcon from "@/assets/icons/play.svg";
import { useCanvasStore, useFramesStore } from "@/store";
import { storeToRefs } from "pinia";
import { PixelBorderSecondary, PixelBorderUltimate } from "../PixelBorder";
import Frame from "./frame.vue";

const canvasStore = useCanvasStore();
const framesStore = useFramesStore();
const { currentTabId } = storeToRefs(canvasStore);
const { frames, currentFrameId } = storeToRefs(framesStore);

const frameIcons = [PlayPrevIcon, PlayIcon, PlayNextIcon];
</script>
<template>
  <div class='h-[600px] mr-2'>
    <PixelBorderSecondary
      wrapper-cls='mb-2.5'
      wrapper-height='h-[53px]'
      background='bg-[#6e8f8b]'
    >
      <div class='flex justify-center items-center'>
        <PixelBorderUltimate
          v-for='(icon, index) in frameIcons'
          :key='index'
        >
          <component :is="icon" class='w-6 h-6' />
        </PixelBorderUltimate>
      </div>
    </PixelBorderSecondary>
    <PixelBorderSecondary
      wrapper-width='w-[140px]'
      wrapper-height='h-[536px]'
      content-cls='flex flex-col items-center pt-2.5 pb-2.5'
      background='bg-[#6e8f8b]'
    >
      <div v-for='frameId of Object.keys(frames)' class='relative' :key='frameId'>
        <Frame
          class='mb-2'
          :snapshot='frames[frameId].snapshot'
          :active='currentFrameId === frameId'
          @click='() => framesStore.switchFrame(frameId)'
        >
        </Frame>
        <ActiveFrameIcon
          v-show='currentFrameId === frameId'
          class='w-8 h-8 absolute top-[50%] left-[-50px] translate-y-[-50%]'
        />
      </div>
      <div
        class='text-[10px] cursor-pointer'
        @click='() => framesStore.createFrame(currentTabId)'
      >add frame</div>
    </PixelBorderSecondary>
  </div>
</template>