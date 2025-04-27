import {
	type BucketMessagePayload,
	type CircleMessagePayload,
	type ClearAllPixelsMessagePayload,
	type ClearHoverRectMessagePayload,
	type ClearRectMessagePayload,
	type ExportMessagePayload,
	ExportTypeEnum,
	type FillHoverRectMessagePayload,
	type FillRectMessagePayload,
	type InitMessagePayload,
	type LineMessagePayload,
	type OffscreenCanvasWorkerMessage,
	type RecordMessagePayload,
	type RedoOrUndoMessagePayload,
	type StrokeRectMessagePayload,
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
			const _payload = payload as FillRectMessagePayload;
			renderUtils.fillRect(_payload);
			recordUtils.updatePointsRecord(_payload);
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
		case "strokeRect":
			renderUtils.strokeRect(payload as StrokeRectMessagePayload);
			break;
		case "fillBucket":
			renderUtils.fillBucket(payload as BucketMessagePayload);
			break;
		case "clearRect": {
			const _payload = payload as ClearRectMessagePayload;
			renderUtils.clearRect(_payload);
			recordUtils.updatePointsRecord(_payload);
			break;
		}
		case "clearHoverRect":
			renderUtils.clearHoverRect(payload as ClearHoverRectMessagePayload);
			break;
		case "clearAllPixels":
			renderUtils.clearAllPixels(payload as ClearAllPixelsMessagePayload);
			break;
		case "record":
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
		case "export": {
			const _payload = payload as ExportMessagePayload;
			const { exportType } = _payload;

			if (exportType === ExportTypeEnum.PNG) {
				const canvas = renderUtils.getCanvas("main");
				canvas && exportUtils.exportToPNG(canvas, self);
			}
		}
	}
};
