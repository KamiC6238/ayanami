import type {
	BucketMessagePayload,
	CircleMessagePayload,
	ClearAllPixelsMessagePayload,
	ClearHoverRectMessagePayload,
	ClearRectMessagePayload,
	ExportMessagePayload,
	FillHoverRectMessagePayload,
	FillRectMessagePayload,
	InitMessagePayload,
	LineMessagePayload,
	OffscreenCanvasWorkerMessage,
	RecordMessagePayload,
	RedoOrUndoMessagePayload,
	SquareMessagePayload,
} from "@/types";
import * as exportUtils from "./utils/export";
import * as recordUtils from "./utils/record";
import * as renderUtils from "./utils/render";

self.onmessage = (e: MessageEvent<OffscreenCanvasWorkerMessage>) => {
	const { type, payload } = e.data;

	switch (type) {
		case "init":
			renderUtils.initOffScreenCanvas(payload as InitMessagePayload);
			break;
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
		case "record":
			renderUtils.clearVisitedPosition();
			recordUtils.record(payload as RecordMessagePayload);
			break;
		case "redo": {
			const _payload = payload as RedoOrUndoMessagePayload;
			const recordStack = recordUtils.getUndoAndRedoStack(_payload.tabId);
			renderUtils.redo(recordStack);
			break;
		}
		case "undo": {
			const _payload = payload as RedoOrUndoMessagePayload;
			const recordStack = recordUtils.getUndoAndRedoStack(_payload.tabId);
			renderUtils.undo(recordStack);
			break;
		}
		case "export":
			exportUtils.exportFile(payload as ExportMessagePayload);
			break;
	}
};
