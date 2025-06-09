<script setup lang="ts">
import { useFramesStore } from "@/store";
import { storeToRefs } from "pinia";
import { PixelBorderSecondary } from "../PixelBorder";
import Frame from "./frame.vue";

const framesStore = useFramesStore();
const { frames, currentFrameId } = storeToRefs(framesStore);
</script>
<template>
  <div class='relative flex items-center h-full mr-2'>
    <PixelBorderSecondary
      wrapper-width='w-[135px]'
      wrapper-height='h-[600px]'
      content-cls='flex flex-col items-center pt-2.5 pb-2.5'
      background='bg-[#6e8f8b]'
    >
      <div v-for='frameId of Object.keys(frames)' class='relative' :key='frameId'>
        <Frame
          class='mb-2'
          :snapshot='frames[frameId].snapshot ?? ""'
          :active='currentFrameId === frameId'
          :enable-delete='Object.keys(frames).length > 1'
          @click='() => framesStore.onFrameAction("switchFrame", { frameId })'
          @delete='() => framesStore.onFrameAction("deleteFrame", { frameId })'
          @copy='() => framesStore.onFrameAction("copyFrame", { frameId })'
        >
        </Frame>
      </div>
    </PixelBorderSecondary>
  </div>
</template>