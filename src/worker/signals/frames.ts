import type { Frames } from "@/types";
import { effect, signal } from "alien-signals";
import { produce } from "immer";
import { v4 as uuidV4 } from "uuid";

const tabs = signal<Record<string, Frames>>({});
const currentFrameId = signal<string>("");

const _updateFrame = (tabId: string, frameId: string, snapshot: string) => {
	tabs(
		produce(tabs(), (draft) => {
			draft[tabId] ??= { frames: {} };
			draft[tabId].frames[frameId] = {
				snapshot,
			};
		}),
	);
};

export const useFrames = () => {
	effect(() => {
		self.postMessage({
			type: "framesUpdated",
			payload: {
				tabs: tabs(),
				currentFrameId: currentFrameId(),
			},
		});
	});

	const getPrevFrameId = (tabId: string, frameId: string) => {
		const frames = tabs()[tabId]?.frames;
		if (!frames) return "";

		const frameIds = Object.keys(frames);
		const frameIndex = frameIds.findIndex((id) => id === frameId);

		if (frameIndex <= 0) return "";
		return frameIds[frameIndex - 1];
	};

	const createFrame = (tabId: string, _frameId?: string) => {
		if (!tabId) return;

		const frameId = _frameId ?? uuidV4();
		const prevFrameId = currentFrameId();
		_updateFrame(tabId, frameId, "");
		currentFrameId(frameId);

		return {
			frameId,
			prevFrameId: prevFrameId,
		};
	};

	const switchFrame = (frameId: string) => {
		if (!frameId) return;
		currentFrameId(frameId);
	};

	const deleteFrame = (tabId: string, frameId: string) => {
		const frames = tabs()[tabId]?.frames;
		if (!frames) {
			return {
				frameId,
				prevFrameId: "",
				originalIndex: -1,
				shouldSwitchFrame: false,
			};
		}

		const frameIds = Object.keys(frames);
		const originalIndex = frameIds.findIndex((id) => id === frameId);
		const isLastFrame = originalIndex === frameIds.length - 1;
		const isCurrentFrame = frameId === currentFrameId();

		let prevFrameId = "";
		if (isCurrentFrame) {
			/**
			 * frames: [f1, f2, f3]
			 * currentFrame: f1
			 * delete f1, prevFrameId should be f2
			 * currentFrame: f2
			 * delete f2, prevFrameId should be f1
			 * currentFrame: f3
			 * delete f3, prevFrameId should be f2
			 * currentFrame: f2
			 * delete f2, prevFrameId should be f1
			 */
			prevFrameId = getPrevFrameId(tabId, frameId);
			if (!prevFrameId && frameIds.length > 1) {
				const nextIndex = originalIndex + 1;
				if (nextIndex < frameIds.length) {
					prevFrameId = frameIds[nextIndex];
				}
			}
		} else {
			prevFrameId = currentFrameId();
		}

		tabs(
			produce(tabs(), (draft) => {
				draft[tabId] ??= { frames: {} };
				delete draft[tabId].frames[frameId];
			}),
		);

		return {
			frameId,
			prevFrameId,
			originalIndex: isLastFrame ? -1 : originalIndex,
			shouldSwitchFrame: isCurrentFrame,
		};
	};

	const reorderFrame = (
		tabId: string,
		frameId: string,
		targetIndex: number,
	) => {
		const frames = tabs()[tabId]?.frames;
		if (!frames) return;

		const frameIds = Object.keys(frames);
		const currentIndex = frameIds.findIndex((id) => id === frameId);

		if (
			currentIndex === -1 ||
			targetIndex < 0 ||
			targetIndex >= frameIds.length ||
			currentIndex === targetIndex
		) {
			return;
		}

		/**
		 * remove the frame from the current index
		 * insert the frame to the target index
		 */
		frameIds.splice(currentIndex, 1);
		frameIds.splice(targetIndex, 0, frameId);

		const reorderedFrames: Record<string, { snapshot: string }> = {};
		for (const id of frameIds) {
			reorderedFrames[id] = frames[id];
		}

		tabs(
			produce(tabs(), (draft) => {
				draft[tabId].frames = reorderedFrames;
			}),
		);
	};

	const updateFrameSnapshot = async ({
		tabId,
		frameId,
		blob,
	}: { tabId: string; frameId: string; blob: Blob }) => {
		if (!tabId || !frameId || !blob) return;

		const arrayBuffer = await blob.arrayBuffer();
		const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
		const base64Snapshot = `data:${blob.type};base64,${base64}`;
		_updateFrame(tabId, frameId, base64Snapshot);
	};

	return {
		tabs,
		currentFrameId,
		getPrevFrameId,
		createFrame,
		switchFrame,
		deleteFrame,
		reorderFrame,
		updateFrameSnapshot,
	};
};
