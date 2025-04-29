import type { CanvasType } from "./canvas";
import type { Position } from "./common";
import type { ToolTypeEnum } from "./config";

export enum ExportTypeEnum {
	PNG = "png",
}

export type MessageType =
	| "init"
	// render utils
	| "fillRect"
	| "fillHoverRect"
	| "drawBresenhamLine"
	| "drawCircle"
	| "strokeRect"
	| "fillBucket"
	| "clearRect"
	| "clearHoverRect"
	| "clearAllPixels"
	// record utils
	| "record"
	| "redo"
	| "undo"
	// export utils
	| "export";

export interface FillRectMessagePayload {
	canvasType: CanvasType;
	position: Position;
	pixelColor: string;
	pixelSize: number;
	toolType?: ToolTypeEnum;
}

export interface FillHoverRectMessagePayload {
	canvasType: CanvasType;
	position: Position;
	pixelColor: string;
	pixelSize: number;
}

export interface StrokeRectMessagePayload {
	canvasType: CanvasType;
	squareStartPosition: Position;
	squareEndPosition: Position;
	pixelColor: string;
	pixelSize: number;
}

export interface LineMessagePayload {
	canvasType: CanvasType;
	lineStartPosition: Position;
	lineEndPosition: Position;
	pixelSize: number;
	pixelColor: string;
}

export interface CircleMessagePayload {
	canvasType: CanvasType;
	toolType: ToolTypeEnum;
	circleStartPosition: Position;
	circleEndPosition: Position;
	pixelSize: number;
	pixelColor: string;
}

export interface BucketMessagePayload {
	replacementColor: string;
	position: Position;
	pixelSize: number;
}

export interface ClearHoverRectMessagePayload {
	canvasType: CanvasType;
	position: Position;
	pixelSize: number;
}

export interface ClearRectMessagePayload {
	canvasType: CanvasType;
	position: Position;
	pixelSize: number;
	toolType?: ToolTypeEnum;
}

export interface ClearAllPixelsMessagePayload {
	canvasType: CanvasType;
}

export interface InitMessagePayload {
	dpr: number;
	clientWidth: number;
	clientHeight: number;
	canvasList: OffscreenCanvas[];
}

export interface RecordMessagePayload {
	tabId: string;
	toolType: ToolTypeEnum;
	pixelSize: number;
	pixelColor: string;
	position?: Position;
	lineStartPosition?: Position;
	lineEndPosition?: Position;
	squareStartPosition?: Position;
	squareEndPosition?: Position;
	circleStartPosition?: Position;
	circleEndPosition?: Position;
}

export interface ExportMessagePayload {
	exportType: ExportTypeEnum;
}

export interface RedoOrUndoMessagePayload {
	tabId: string;
}

export type MessagePayload =
	| InitMessagePayload
	| FillRectMessagePayload
	| FillHoverRectMessagePayload
	| LineMessagePayload
	| CircleMessagePayload
	| StrokeRectMessagePayload
	| BucketMessagePayload
	| ClearRectMessagePayload
	| ClearHoverRectMessagePayload
	| ClearAllPixelsMessagePayload
	| RecordMessagePayload
	| RedoOrUndoMessagePayload
	| ExportMessagePayload;

export interface OffscreenCanvasWorkerMessage {
	type: MessageType;
	payload?: MessagePayload;
}
