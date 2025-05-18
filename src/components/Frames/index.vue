<script setup lang="ts">
import { useCanvasStore } from "@/store";
import { storeToRefs } from "pinia";
import Frame from "./frame.vue";

const canvasStore = useCanvasStore();
const { frames } = storeToRefs(canvasStore);
</script>
<template>
  <div class='mr-2'>
    <Frame v-for='frameId of Object.keys(frames)' class='mb-2' :key='frameId' />
  </div>
</template>