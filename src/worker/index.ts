import type {
	BucketMessagePayload,
	CircleMessagePayload,
	ClearAllPixelsMessagePayload,
	ClearHoverRectMessagePayload,
	ClearRectMessagePayload,
	ExportMessagePayload,
	FillHoverRectMessagePayload,
	FillRectMessagePayload,
	ImportMessagePayload,
	InitMessagePayload,
	LineMessagePayload,
	OffscreenCanvasWorkerMessage,
	RecordMessagePayload,
	RedoOrUndoMessagePayload,
	SquareMessagePayload,
	SwitchFrameMessagePayload,
} from "@/types";
import { useRecords, useRender } from "./signals";
import * as fileUtils from "./utils/file";
import * as frameUtils from "./utils/frame";
import * as recordUtils from "./utils/record";
import * as renderUtils from "./utils/render";

const { initRecords } = useRecords();
const { initOffScreenCanvas, clearVisitedPosition } = useRender();

self.onmessage = (e: MessageEvent<OffscreenCanvasWorkerMessage>) => {
	const { type, payload } = e.data;

	switch (type) {
		case "init": {
			const _payload = payload as InitMessagePayload;
			initRecords(_payload.tabId);
			initOffScreenCanvas(_payload);
			break;
		}
		case "fillRect": {
			renderUtils.fillRect(payload as FillRectMessagePayload);
			break;
		}
		case "fillHoverRect":
			renderUtils.fillHoverRect(payload as FillHoverRectMessagePayload);
			break;
		case "drawBresenhamLine":
			renderUtils.drawBresenhamLine(payload as LineMessagePayload);
			break;
		case "drawCircle":
			renderUtils.drawCircle(payload as CircleMessagePayload);
			break;
		case "drawSquare":
			renderUtils.drawSquare(payload as SquareMessagePayload);
			break;
		case "fillBucket":
			renderUtils.fillBucket(payload as BucketMessagePayload);
			break;
		case "clearRect": {
			const _payload = payload as ClearRectMessagePayload;
			renderUtils.clearRect(_payload);
			break;
		}
		case "clearHoverRect":
			renderUtils.clearHoverRect(payload as ClearHoverRectMessagePayload);
			break;
		case "clearAllPixels":
			renderUtils.clearAllPixels(payload as ClearAllPixelsMessagePayload);
			break;
		case "record": {
			clearVisitedPosition();
			const _payload = payload as RecordMessagePayload;
			const recorded = recordUtils.record(_payload);
			recorded && frameUtils.generateSnapshot(_payload);
			break;
		}
		case "redo": {
			const _payload = payload as RedoOrUndoMessagePayload;
			recordUtils.redo(_payload);
			break;
		}
		case "undo": {
			const _payload = payload as RedoOrUndoMessagePayload;
			recordUtils.undo(_payload);
			break;
		}
		case "export":
			fileUtils.exportFile(payload as ExportMessagePayload);
			break;
		case "import":
			fileUtils.importFile(payload as ImportMessagePayload);
			break;
		case "switchFrame":
			frameUtils.switchFrame(payload as SwitchFrameMessagePayload);
			break;
	}
};
