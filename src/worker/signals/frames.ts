import type { Frame } from "@/types";
import { effect, signal } from "alien-signals";
import { produce } from "immer";
import { v4 as uuidV4 } from "uuid";
import { useRecords } from "./records";

const tabs = signal<Record<string, { frames: Record<string, Frame> }>>({});
const currentFrameId = signal("");
const { getDrawRecordsWithFrameId } = useRecords();

interface UpdateFrameConfig {
	snapshot?: string;
	frameId?: string;
	isCopiedFrame?: boolean;
	sourceFrameId?: string;
	sourceFrameChain?: string[];
	copyTimestamp?: number;
	sourceFrameTimestamps?: Record<string, number>;
}
const _updateFrame = (
	tabId: string,
	frameId: string,
	config: UpdateFrameConfig,
) => {
	tabs(
		produce(tabs(), (draft) => {
			draft[tabId] ??= { frames: {} };
			draft[tabId].frames[frameId] = {
				...draft[tabId].frames[frameId],
				...config,
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

	const getFrame = (tabId: string, frameId: string) => {
		const frames = tabs()[tabId]?.frames;
		if (!frames) return null;
		return frames[frameId];
	};

	const getPrevFrameId = (tabId: string, frameId: string) => {
		const frames = tabs()[tabId]?.frames;
		if (!frames) return "";

		const frameIds = Object.keys(frames);
		const frameIndex = frameIds.findIndex((id) => id === frameId);

		if (frameIndex <= 0) return "";
		return frameIds[frameIndex - 1];
	};

	const createFrame = (tabId: string, config?: UpdateFrameConfig) => {
		if (!tabId) {
			return {
				frameId: "",
				prevFrameId: "",
			};
		}

		const frameId = config?.frameId ?? uuidV4();
		const prevFrameId = currentFrameId();
		_updateFrame(tabId, frameId, { ...config });
		currentFrameId(frameId);

		return {
			frameId,
			prevFrameId,
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

	const copyFrame = (tabId: string, sourceFrameId: string) => {
		const frames = tabs()[tabId]?.frames;
		const frameIds = Object.keys(frames);
		const sourceIndex = frameIds.findIndex((id) => id === sourceFrameId);
		const sourceFrame = frames[sourceFrameId];
		const sourceFrameChain = sourceFrame?.sourceFrameChain ?? [];

		// Check if source frame has its own drawing records
		const sourceFrameDrawRecords = getDrawRecordsWithFrameId(
			tabId,
			sourceFrameId,
		);
		const hasSourceFrameDrawRecords =
			sourceFrameDrawRecords && sourceFrameDrawRecords.length > 0;

		// Record timestamp when copying
		const copyTimestamp = Date.now();

		let newSourceFrameChain: string[] = [];
		let sourceFrameTimestamps: Record<string, number> = {};

		if (hasSourceFrameDrawRecords) {
			// Source frame has drawing records, add source frame to dependency chain
			newSourceFrameChain = [...sourceFrameChain, sourceFrameId];

			// Inherit timestamp limits from source frame
			sourceFrameTimestamps = { ...sourceFrame?.sourceFrameTimestamps };

			// Set timestamp limits for each frame in dependency chain
			for (const chainFrameId of sourceFrameChain) {
				if (!sourceFrameTimestamps[chainFrameId]) {
					sourceFrameTimestamps[chainFrameId] = copyTimestamp;
				}
			}

			// Set timestamp limit for source frame
			sourceFrameTimestamps[sourceFrameId] = copyTimestamp;
		} else {
			// Source frame has no drawing records (pure copied frame), inherit its dependency chain and timestamp constraints
			newSourceFrameChain = sourceFrameChain;
			// Directly inherit timestamp limits from source frame
			sourceFrameTimestamps = { ...sourceFrame?.sourceFrameTimestamps };
		}

		// Create new frame, save dependency chain, copy timestamp and timestamp limits
		const { frameId } = createFrame(tabId, {
			isCopiedFrame: true,
			sourceFrameId,
			sourceFrameChain: newSourceFrameChain,
			copyTimestamp: copyTimestamp,
			sourceFrameTimestamps: sourceFrameTimestamps,
		});

		if (!frameId) {
			return {
				frameId: "",
				prevFrameId: "",
			};
		}

		const targetIndex = sourceIndex + 1;
		reorderFrame(tabId, frameId, targetIndex);

		return {
			frameId,
			prevFrameId: sourceFrameId,
			copyTimestamp: copyTimestamp,
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

		const reorderedFrames: Record<string, Frame> = {};
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
		_updateFrame(tabId, frameId, {
			snapshot: base64Snapshot,
		});
	};

	return {
		tabs,
		currentFrameId,
		getFrame,
		getPrevFrameId,
		createFrame,
		switchFrame,
		deleteFrame,
		copyFrame,
		reorderFrame,
		updateFrameSnapshot,
	};
};
