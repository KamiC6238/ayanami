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
		tabs(
			produce(tabs(), (draft) => {
				draft[tabId] ??= { frames: {} };
				delete draft[tabId].frames[frameId];
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
		createFrame,
		switchFrame,
		deleteFrame,
		updateFrameSnapshot,
	};
};
