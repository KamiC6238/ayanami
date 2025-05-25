import type { SwitchFrameMessagePayload } from "@/types";
import { useRender } from "../signals";
import * as recordUtils from "./record";
import * as renderUtils from "./render";

const { getCanvas } = useRender();

export const generateSnapshot = (config: {
	tabId: string;
	frameId: string;
}) => {
	const canvas = getCanvas("main");
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
	const records = recordUtils.getRecordsWithFrameId(tabId, frameId);

	renderUtils.clearAllPixels({ canvasType: "main" });
	recordUtils.replayRecords(records, {
		tabId,
		frameId,
		canvasType: "main",
	});
};
