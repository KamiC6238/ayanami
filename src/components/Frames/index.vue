<script setup lang="ts">
import { useFramesStore } from "@/store";
import { storeToRefs } from "pinia";
import { PixelBorderSecondary } from "../PixelBorder";
import Frame from "./Frame.vue";

const framesStore = useFramesStore();
const { frames, currentFrameId } = storeToRefs(framesStore);
</script>
<template>
  <div class='relative flex items-center h-full mr-2'>
    <PixelBorderSecondary
      wrapper-width='w-[135px]'
      wrapper-height='h-[600px]'
      content-cls='flex flex-col items-center pt-2.5 pb-2.5 overflow-auto w-[calc(100%-13px)] left-[3px]'
      background='bg-[#6e8f8b]'
    >
      <div
        v-for='frameId of Object.keys(frames)'
        :class='[
          "relative",
          "mb-2",
          currentFrameId === frameId
            ? "w-[105%] flex items-center justify-center bg-[#4c5d5b]"
            : ""
          ]
        '
        :key='frameId'
      >
        <Frame
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