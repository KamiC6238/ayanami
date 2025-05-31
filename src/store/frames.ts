import type { Frames } from "@/types";
import { defineStore } from "pinia";
import { v4 as uuidV4 } from "uuid";
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
					case "snapshot":
						updateSnapshot(payload);
						break;
					case "updateFrameId":
						updateFrameId(payload.frameId);
						break;
				}
			});
		},
	);

	const frames = computed(() => {
		const currentTabId = canvasStore.getCurrentTabId();
		if (!currentTabId) return {};

		return tabs.value[currentTabId].frames;
	});

	const frameDuration = computed(() => Math.floor(1000 / fps.value));

	const framesSnapshot = computed(() => {
		const currentTabId = canvasStore.getCurrentTabId();
		if (!currentTabId) return [];
		return Object.values(tabs.value[currentTabId].frames).map(
			(frame) => frame.snapshot,
		);
	});

	const getCurrentFrameId = () => currentFrameId.value;

	const setIsFramesPlaying = (isPlaying: boolean) => {
		isFramesPlaying.value = isPlaying;
	};

	const setFps = (_fps: number) => {
		fps.value = _fps;
	};

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

	const updateSnapshot = (payload: {
		tabId: string;
		frameId: string;
		blob: Blob;
	}) => {
		const { tabId, frameId, blob } = payload;
		const reader = new FileReader();

		reader.onloadend = () => {
			const tab = tabs.value[tabId];
			const frame = tab.frames[frameId];
			if (!frame) return;

			tabs.value[tabId].frames[frameId].snapshot = reader.result as string;
		};
		reader.readAsDataURL(blob);
	};

	const updateFrameId = (frameId: string) => {
		currentFrameId.value = frameId;
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
		createFrame,
		switchFrame,
		updateFrameId,
	};
});
