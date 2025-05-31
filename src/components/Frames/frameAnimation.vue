<script setup lang="ts">
import { useFramesStore } from "@/store";
import { storeToRefs } from "pinia";
import { ref, watch } from "vue";

const snapshot = ref("");
const interval = ref<number | null>(null);
const currentFrameIndex = ref(0);
const framesStore = useFramesStore();
const { isFramesPlaying, frameDuration, framesSnapshot } =
	storeToRefs(framesStore);

watch(
	() => isFramesPlaying.value,
	(newVal) => {
		if (newVal) {
			clearInterval();
			updateSnapshot();
			interval.value = window.setInterval(updateSnapshot, frameDuration.value);
		} else {
			clearInterval();
		}
	},
);

const updateSnapshot = () => {
	snapshot.value = framesSnapshot.value[currentFrameIndex.value];
	currentFrameIndex.value++;

	if (currentFrameIndex.value >= framesSnapshot.value.length) {
		currentFrameIndex.value = 0;
	}
};

const clearInterval = () => {
	if (interval.value) {
		window.clearInterval(interval.value);
		interval.value = null;
	}
};
</script>

<template>
  <div
    v-if="isFramesPlaying && snapshot"
    class="absolute top-0 left-0 w-full h-full bg-red z-[11]"
  >
    <img :src="snapshot" alt="frame-snapshot" />
  </div>
</template> 