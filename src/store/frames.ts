import type { Frames } from "@/types";
import { defineStore } from "pinia";
import { v4 as uuidV4 } from "uuid";
import { computed, ref, watch } from "vue";
import { useCanvasStore } from "./canvas";

export const useFramesStore = defineStore("frames", () => {
	const tabs = ref<Record<string, Frames>>({});
	const currentFrameId = ref("");

	const canvasStore = useCanvasStore();

	watch(
		() => canvasStore.canvasWorker,
		(worker) => {
			if (!worker) return;

			worker.addEventListener("message", (e) => {
				const { type, payload } = e.data;
				if (type !== "snapshot") return;

				const { tabId, frameId, blob } = payload;
				const reader = new FileReader();

				reader.onloadend = () =>
					updateSnapshot(tabId, frameId, reader.result as string);
				reader.readAsDataURL(blob);
			});
		},
	);

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

		canvasStore.canvasWorker?.postMessage({
			type: "switchFrame",
			payload: {
				tabId: canvasStore.getCurrentTabId(),
				frameId,
			},
		});
	};

	const updateSnapshot = (tabId: string, frameId: string, snapshot: string) => {
		const tab = tabs.value[tabId];
		const frame = tab.frames[frameId];

		if (!frame) return;

		tabs.value[tabId].frames[frameId].snapshot = snapshot;
	};

	return {
		frames,
		currentFrameId,
		getCurrentFrameId,
		createFrame,
		switchFrame,
	};
});
