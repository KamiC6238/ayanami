import type { Frames } from "@/types";
import { defineStore } from "pinia";
import { v4 as uuidV4 } from "uuid";
import { computed, ref } from "vue";
import { useCanvasStore } from "./canvas";

export const useFramesStore = defineStore("frames", () => {
	const tabs = ref<Record<string, Frames>>({});
	const currentFrameId = ref("");

	const canvasStore = useCanvasStore();

	const frames = computed(() => {
		const currentTabId = canvasStore.getCurrentTabId();
		if (!currentTabId) return {};

		return tabs.value[currentTabId].frames;
	});

	const getCurrentFrameId = () => currentFrameId.value;

	const createFrame = (tabId: string) => {
		const frameId = uuidV4();

		tabs.value = {
			...tabs.value,
			[tabId]: {
				frames: {
					...(tabs.value[tabId]?.frames ?? {}),
					[frameId]: {
						snapshot: "",
					},
				},
			},
		};

		switchFrame(frameId);
	};

	const switchFrame = (frameId: string) => {
		currentFrameId.value = frameId;
	};

	return {
		frames,
		currentFrameId,
		getCurrentFrameId,
		createFrame,
		switchFrame,
	};
});
