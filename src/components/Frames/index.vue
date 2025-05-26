<script setup lang="ts">
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
    <Frame
      class='mb-2'
      v-for='frameId of Object.keys(frames)'
      :key='frameId'
      :snapshot='frames[frameId].snapshot'
      :active='currentFrameId === frameId'
      @click='() => framesStore.switchFrame(frameId)'
    />
    <div
      class='text-[10px] cursor-pointer'
      @click='() => framesStore.createFrame(currentTabId)'
    >add frame</div>
  </div>
</template>