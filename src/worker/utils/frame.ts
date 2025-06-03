import type {
	CreateFrameMessagePayload,
	SwitchFrameMessagePayload,
} from "@/types";
import { useFrames, useRecords, useRender } from "../signals";
import * as recordUtils from "./record";

const { getRecordsWithFrameId } = useRecords();
const { getCanvas } = useRender();
const {
	createFrame: _createFrame,
	switchFrame: _switchFrame,
	updateFrameSnapshot,
} = useFrames();

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
			updateFrameSnapshot({
				tabId: config.tabId,
				frameId: config.frameId,
				blob,
			});
		});
};

export const createFrame = (payload: CreateFrameMessagePayload) => {
	_createFrame(payload.tabId);
};

export const switchFrame = (payload: SwitchFrameMessagePayload) => {
	const { tabId, frameId } = payload;
	_switchFrame(frameId);
	recordUtils.replayRecords(getRecordsWithFrameId(tabId, frameId), { tabId });
};
