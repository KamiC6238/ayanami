<script setup lang="ts">
import { useFramesStore } from "@/store";
import { storeToRefs } from "pinia";
import { ref, watch } from "vue";

const snapshot = ref("");
const currentFrameIndex = ref(-1);
const interval = ref<number | null>(null);
const framesStore = useFramesStore();
const { isFramesPlaying, frameDuration, framesSnapshot, frames } =
	storeToRefs(framesStore);

watch(
	() => isFramesPlaying.value,
	(newVal) => {
		clearInterval();

		if (newVal) {
			updateSnapshot();
			interval.value = window.setInterval(updateSnapshot, frameDuration.value);
		} else {
			const frameId = Object.keys(frames.value)[currentFrameIndex.value];
			framesStore.switchFrame(frameId);
		}
	},
);

const updateSnapshot = () => {
	if (!isFramesPlaying.value) {
		return;
	}

	currentFrameIndex.value++;

	if (currentFrameIndex.value >= framesSnapshot.value.length) {
		currentFrameIndex.value = 0;
	}

	snapshot.value = framesSnapshot.value[currentFrameIndex.value];
};

const clearInterval = () => {
	if (typeof interval.value === "number") {
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