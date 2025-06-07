import type {
	CreateFrameMessagePayload,
	SwitchFrameMessagePayload,
} from "@/types";
import { FrameTypeEnum } from "@/types";
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
	const { tabId } = payload;
	const { frameId, prevFrameId } = _createFrame(tabId) ?? {};
	if (!frameId || !prevFrameId) return;

	recordUtils.record({
		tabId,
		frameId,
		prevFrameId,
		frameType: FrameTypeEnum.Create,
	});

	switchFrame({ tabId, frameId });
};

export const switchFrame = (payload: SwitchFrameMessagePayload) => {
	const { tabId, frameId } = payload;
	_switchFrame(frameId);
	recordUtils.replayRecords(getRecordsWithFrameId(tabId, frameId), { tabId });
	generateSnapshot({ tabId, frameId });
};
