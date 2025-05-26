import type { SwitchFrameMessagePayload } from "@/types";
import { useRecords, useRender } from "../signals";
import * as recordUtils from "./record";

const { getRecordsWithFrameId } = useRecords();
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
	recordUtils.replayRecords(getRecordsWithFrameId(tabId, frameId), { tabId });
};
