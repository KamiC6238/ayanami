<script setup lang="ts">
import { useFramesStore } from "@/store";
import { storeToRefs } from "pinia";
import Frame from "./frame.vue";

const framesStore = useFramesStore();
const { frames } = storeToRefs(framesStore);
</script>
<template>
  <div class='mr-2'>
    <Frame
      class='mb-2'
      v-for='frameId of Object.keys(frames)'
      :key='frameId'
      @click='() => framesStore.switchFrame(frameId)'
    />
  </div>
</template>