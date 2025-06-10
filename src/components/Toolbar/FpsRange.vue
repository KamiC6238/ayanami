<script setup lang="ts">
import RangeInput from "@/components/RangeInput.vue";
import { DEFAULT_FPS, STORAGE_KEY_FOR_FPS } from "@/constants";
import { useFramesStore } from "@/store";
import { useLocalStorage } from "@vueuse/core";
import { onMounted } from "vue";

const framesStore = useFramesStore();
const storage = useLocalStorage(STORAGE_KEY_FOR_FPS, DEFAULT_FPS);

onMounted(() => {
	framesStore.setFps(storage.value);
});

const onFpsChange = (e: Event) => {
	const fps = Number((e.target as HTMLInputElement).value);
	framesStore.setFps(fps);
	storage.value = fps;
};
</script>
<template>
  <RangeInput
    class='ml-4'
    :value="framesStore.fps"
    :min="1"
    :max="DEFAULT_FPS"
    :step="1"
    unit="fps"
    @value-change="onFpsChange"
  />
</template>