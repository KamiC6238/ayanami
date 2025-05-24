import type { SwitchFrameMessagePayload } from "@/types";
import * as renderUtils from "./render";

export const generateSnapshot = (config: {
	tabId: string;
	frameId: string;
}) => {
	const canvas = renderUtils.getCanvas("main");
	canvas
		?.convertToBlob({
			type: "image/png",
			quality: 1,
		})
		.then((blob) => {
			self.postMessage({
				type: "snapshot",
				payload: {
					...config,
					blob,
				},
			});
		});
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
