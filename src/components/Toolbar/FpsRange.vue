<script setup lang="ts">
import RangeInput from "@/components/RangeInput.vue";
import { useFramesStore } from "@/store";
import { computed } from "vue";

const framesStore = useFramesStore();

const fps = computed(() => framesStore.fps);

const onFpsChange = (e: Event) => {
	framesStore.setFps(Number((e.target as HTMLInputElement).value));
};
</script>
<template>
  <RangeInput
    class='ml-4'
    :value="fps"
    :min="1"
    :max="24"
    :step="1"
    unit="fps"
    @value-change="onFpsChange"
  />
</template>