import type { Frames } from "@/types";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { useCanvasStore } from "./canvas";

export const useFramesStore = defineStore("frames", () => {
	const tabs = ref<Record<string, Frames>>({});
	const currentFrameId = ref("");
	const isFramesPlaying = ref(false);
	const fps = ref(24);

	const canvasStore = useCanvasStore();

	watch(
		() => canvasStore.canvasWorker,
		(worker) => {
			if (!worker) return;

			worker.addEventListener("message", (e) => {
				const { type, payload } = e.data;

				switch (type) {
					case "framesUpdated":
						tabs.value = payload.tabs;
						currentFrameId.value = payload.currentFrameId;
						break;
				}
			});
		},
	);

	const frames = computed(() => {
		const currentTabId = canvasStore.getCurrentTabId();
		if (!currentTabId) return {};

		return tabs.value[currentTabId]?.frames || {};
	});

	const frameDuration = computed(() => Math.floor(1000 / fps.value));

	const framesSnapshot = computed(() => {
		const currentTabId = canvasStore.getCurrentTabId();

		return currentTabId
			? Object.values(tabs.value[currentTabId]?.frames || {}).map(
					(frame) => frame.snapshot,
				)
			: [];
	});

	const getCurrentFrameId = () => currentFrameId.value;

	const setIsFramesPlaying = (isPlaying: boolean) => {
		isFramesPlaying.value = isPlaying;
	};

	const setFps = (_fps: number) => {
		fps.value = _fps;
	};

	const onFrameAction = (
		action: "createFrame" | "switchFrame",
		payload?: { frameId: string },
	) => {
		canvasStore.canvasWorker?.postMessage({
			type: action,
			payload: {
				tabId: canvasStore.getCurrentTabId(),
				...payload,
			},
		});
	};

	return {
		frames,
		currentFrameId,
		isFramesPlaying,
		fps,
		frameDuration,
		framesSnapshot,
		getCurrentFrameId,
		setIsFramesPlaying,
		setFps,
		onFrameAction,
	};
});
