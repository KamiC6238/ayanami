import type {
	CopyFrameMessagePayload,
	CreateFrameMessagePayload,
	DeleteFrameMessagePayload,
	SwitchFrameMessagePayload,
} from "@/types";
import { FrameTypeEnum } from "@/types";
import { useFrames, useRender } from "../signals";
import * as recordUtils from "./record";

const { getCanvas } = useRender();
const {
	createFrame: _createFrame,
	switchFrame: _switchFrame,
	deleteFrame: _deleteFrame,
	prepareDeleteFrame: _prepareDeleteFrame,
	executeDeleteFrame: _executeDeleteFrame,
	copyFrame: _copyFrame,
	updateFrameSnapshot,
	reorderFrame: _reorderFrame,
	getFrame,
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
	const { tabId, frameId, sourceFrameId } = payload;
	_switchFrame(frameId);

	const frame = getFrame(tabId, frameId);
	if (!frame) return;

	// Check if it's a copied frame with copy timestamp
	if (frame.copyTimestamp && frame.sourceFrameChain) {
		// Copied frame with timestamp-based record filtering
		const { sourceFrameChain, sourceFrameTimestamps } = frame;

		// Replay drawing records from source frame chain, using different timestamp limits for each frame
		const hasReplayed = recordUtils.replayFrameChain(
			tabId,
			sourceFrameChain,
			sourceFrameTimestamps,
			frame.copyTimestamp,
		);

		// Replay current frame's own drawing records (if any)
		recordUtils.replayFrameRecords(tabId, frameId, !hasReplayed);
	} else if (sourceFrameId) {
		// If sourceFrameId is passed, this is temporary display during copy operation
		// Need to display complete content of source frame (sourceFrameChain + source frame's own drawing records)
		const sourceFrame = getFrame(tabId, sourceFrameId);
		const { sourceFrameChain = [] } = sourceFrame ?? {};

		// Replay source frame's dependency chain
		const hasReplayed = recordUtils.replayFrameChain(tabId, sourceFrameChain);

		// Then replay source frame's own drawing records
		recordUtils.replayFrameRecords(tabId, sourceFrameId, !hasReplayed);
	} else {
		// Normal frame switching, using target frame's own information
		const { sourceFrameChain = [] } = frame;

		// Replay drawing records from source frame chain
		const hasReplayed = recordUtils.replayFrameChain(tabId, sourceFrameChain);

		// Replay current frame's own drawing records
		recordUtils.replayFrameRecords(tabId, frameId, !hasReplayed);
	}

	generateSnapshot({ tabId, frameId });
};

export const deleteFrame = (payload: DeleteFrameMessagePayload) => {
	const { tabId, frameId } = payload;

	// 1. Prepare deletion and get frame info (but don't delete yet)
	const { prevFrameId, originalIndex, shouldSwitchFrame, frameToDelete } =
		_prepareDeleteFrame(tabId, frameId);
	if (!prevFrameId) return;

	// 2. Record the operation (frame still exists at this point)
	recordUtils.record({
		tabId,
		frameId,
		prevFrameId,
		originalIndex,
		shouldSwitchFrame,
		frameType: FrameTypeEnum.Delete,
		frameToDelete, // Pass the captured frame info
	});

	// 3. Actually execute the deletion
	_executeDeleteFrame(tabId, frameId);

	switchFrame({ tabId, frameId: prevFrameId });
};

export const copyFrame = (payload: CopyFrameMessagePayload) => {
	const { tabId, frameId: sourceFrameId } = payload;
	const { frameId } = _copyFrame(tabId, sourceFrameId);
	if (!frameId) return;

	recordUtils.record({
		tabId,
		frameId,
		sourceFrameId,
		frameType: FrameTypeEnum.Copy,
	});

	// Pass sourceFrameId to ensure copied frame can immediately display complete content of source frame
	switchFrame({
		tabId,
		frameId,
		sourceFrameId,
	});
};

export const reorderFrame = (config: {
	tabId: string;
	frameId: string;
	targetIndex: number;
}) => {
	const { tabId, frameId, targetIndex } = config;
	_reorderFrame(tabId, frameId, targetIndex);
};
