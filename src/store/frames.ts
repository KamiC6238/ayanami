import { defineStore, storeToRefs } from "pinia";
import { v4 as uuidV4 } from "uuid";
import { computed, ref } from "vue";
import { useCanvasStore } from "./canvas";

export const useFramesStore = defineStore("frames", () => {
	const currentFrameId = ref("");

	const canvasStore = useCanvasStore();
	const { tabs, currentTabId } = storeToRefs(canvasStore);

	const frames = computed(() => {
		if (!currentTabId.value) {
			return {};
		}

		return tabs.value[currentTabId.value].frames;
	});

	const createFrame = () => {
		const frameId = uuidV4();

		switchFrame(frameId);

		return {
			[frameId]: {},
		};
	};

	const switchFrame = (frameId: string) => {
		currentFrameId.value = frameId;
	};

	return {
		frames,
		currentFrameId,
		createFrame,
		switchFrame,
	};
});
