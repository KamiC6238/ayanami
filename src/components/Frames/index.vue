<script setup lang="ts">
import ActiveFrameIcon from "@/assets/icons/active-frame.svg";
import { useCanvasStore, useFramesStore } from "@/store";
import { storeToRefs } from "pinia";
import Frame from "./frame.vue";

const canvasStore = useCanvasStore();
const framesStore = useFramesStore();
const { currentTabId } = storeToRefs(canvasStore);
const { frames, currentFrameId } = storeToRefs(framesStore);
</script>
<template>
  <div class='mr-2'>
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
        class='w-8 h-8 absolute top-[50%] left-[-35px] translate-y-[-50%]'
      />
    </div>
    <div
      class='text-[10px] cursor-pointer'
      @click='() => framesStore.createFrame(currentTabId)'
    >add frame</div>
  </div>
</template>