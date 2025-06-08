import type {
	CreateFrameMessagePayload,
	DeleteFrameMessagePayload,
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
	deleteFrame: _deleteFrame,
	updateFrameSnapshot,
	reorderFrame: _reorderFrame,
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

export const deleteFrame = (payload: DeleteFrameMessagePayload) => {
	const { tabId, frameId } = payload;
	const { prevFrameId, originalIndex, shouldSwitchFrame } = _deleteFrame(
		tabId,
		frameId,
	);
	if (!prevFrameId) return;

	recordUtils.record({
		tabId,
		frameId,
		prevFrameId,
		originalIndex,
		shouldSwitchFrame,
		frameType: FrameTypeEnum.Delete,
	});

	switchFrame({ tabId, frameId: prevFrameId });
};

export const reorderFrame = (config: {
	tabId: string;
	frameId: string;
	targetIndex: number;
}) => {
	const { tabId, frameId, targetIndex } = config;
	_reorderFrame(tabId, frameId, targetIndex);
};
