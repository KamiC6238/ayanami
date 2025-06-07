import type { CanvasType } from "./canvas";
import type { Position } from "./common";
import type { FrameTypeEnum, ToolTypeEnum } from "./config";

export enum ExportTypeEnum {
	PNG = "png",
	Source = "source",
}

export type FrameAction = "createFrame" | "switchFrame" | "deleteFrame";

export type MessageType =
	| "init"
	| "fillRect"
	| "fillHoverRect"
	| "drawBresenhamLine"
	| "drawCircle"
	| "drawSquare"
	| "fillBucket"
	| "clearRect"
	| "clearHoverRect"
	| "clearAllPixels"
	| "record"
	| "redo"
	| "undo"
	| "export"
	| "import"
	| FrameAction;

export interface FillRectMessagePayload {
	canvasType: CanvasType;
	position: Position;
	pixelColor: string;
	pixelSize: number;
	toolType?: ToolTypeEnum;
	isReplay?: boolean;
}

export interface FillHoverRectMessagePayload {
	canvasType: CanvasType;
	position: Position;
	pixelColor: string;
	pixelSize: number;
}

export interface SquareMessagePayload {
	canvasType: CanvasType;
	squareStartPosition: Position;
	squareEndPosition: Position;
	pixelColor: string;
	pixelSize: number;
}

export interface LineMessagePayload {
	toolType: ToolTypeEnum;
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
	canvasType: CanvasType;
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
	isReplay?: boolean;
}

export interface ClearAllPixelsMessagePayload {
	canvasType: CanvasType;
}

export interface InitMessagePayload {
	tabId: string;
	dpr: number;
	clientWidth: number;
	clientHeight: number;
	canvasList: OffscreenCanvas[];
}

export interface RecordMessagePayload {
	tabId: string;
	frameId: string;
	prevFrameId?: string;
	toolType?: ToolTypeEnum;
	frameType?: FrameTypeEnum;
	pixelSize?: number;
	pixelColor?: string;
	position?: Position;
	lineStartPosition?: Position;
	lineEndPosition?: Position;
	squareStartPosition?: Position;
	squareEndPosition?: Position;
	circleStartPosition?: Position;
	circleEndPosition?: Position;
}

export interface ExportMessagePayload {
	tabId: string;
	exportType: ExportTypeEnum;
}

export interface ImportMessagePayload {
	tabId: string;
	file: File;
}

export interface RedoOrUndoMessagePayload {
	tabId: string;
	frameId: string;
}

export interface SwitchFrameMessagePayload {
	tabId: string;
	frameId: string;
}

export type CreateFrameMessagePayload = SwitchFrameMessagePayload;

export type DeleteFrameMessagePayload = SwitchFrameMessagePayload;

export type MessagePayload =
	| InitMessagePayload
	| FillRectMessagePayload
	| FillHoverRectMessagePayload
	| LineMessagePayload
	| CircleMessagePayload
	| SquareMessagePayload
	| BucketMessagePayload
	| ClearRectMessagePayload
	| ClearHoverRectMessagePayload
	| ClearAllPixelsMessagePayload
	| RecordMessagePayload
	| RedoOrUndoMessagePayload
	| ExportMessagePayload
	| ImportMessagePayload
	| SwitchFrameMessagePayload
	| DeleteFrameMessagePayload;

export interface OffscreenCanvasWorkerMessage {
	type: MessageType;
	payload?: MessagePayload;
}
