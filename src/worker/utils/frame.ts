import { ToolTypeEnum } from "@/types";
import * as recordUtils from "./record";
import * as renderUtils from "./render";

interface ExportFrameSnapshot {
	tabId: string;
	frameId: string;
}
export const exportFrameSnapshot = (config: ExportFrameSnapshot) => {
	const { tabId, frameId } = config;
	const records = recordUtils.getUndoAndRedoStack(tabId);
	const recordsWithFrameId = records.undoStack.filter((record) => {
		const [toolType] = record;
		const frameIndex = toolType === ToolTypeEnum.Eraser ? record[1] : record[2];
		const _frameIndex = recordUtils.getFrameIndex(tabId, frameId);
		return _frameIndex === frameIndex;
	});

	renderUtils.replayRecords(recordsWithFrameId, {
		tabId,
		frameId,
		canvasType: "snapshot",
	});

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
