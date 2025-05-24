import type { SwitchFrameMessagePayload } from "@/types";
import * as renderUtils from "./render";

const generateSnapshot = (tabId: string, frameId: string) => {
	const canvas = renderUtils.getCanvas("snapshot");
	canvas
		?.convertToBlob({
			type: "image/png",
			quality: 1,
		})
		.then((blob) => {
			self.postMessage({
				type: "snapshot",
				payload: {
					tabId,
					frameId,
					blob,
				},
			});
		});
};

export const generateFrameSnapshot = (config: {
	tabId: string;
	frameId: string;
}) => {
	const { tabId, frameId } = config;
	const records = renderUtils.getRecordsWithFrameId(tabId, frameId);

	renderUtils.replayRecords(records, {
		tabId,
		frameId,
		canvasType: "snapshot",
	});

	generateSnapshot(tabId, frameId);
};

export const switchFrame = (payload: SwitchFrameMessagePayload) => {
	const { tabId, frameId } = payload;
	const records = renderUtils.getRecordsWithFrameId(tabId, frameId);

	renderUtils.clearAllPixels({ canvasType: "main" });
	renderUtils.replayRecords(records, {
		tabId,
		frameId,
		canvasType: "main",
	});
};
