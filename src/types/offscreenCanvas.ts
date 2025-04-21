import type { CanvasType } from "./canvas";
import type { Position } from "./common";
import type { CircleTypeEnum, ToolTypeEnum } from "./config";

export type MessageType =
	| "init"
	| "fillRect"
	| "fillHoverRect"
	| "drawBresenhamLine"
	| "drawCircle"
	| "strokeRect"
	| "clearRect"
	| "clearHoverRect"
	| "clearAllPixels"
	| "record"
	| "redo"
	| "undo";

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
	position: Position;
	pixelColor: string;
	pixelSize: number;
	endPosition: Position;
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
	circleType: CircleTypeEnum;
	circleStartPosition: Position;
	circleEndPosition: Position;
	pixelSize: number;
	pixelColor: string;
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
}

export interface OffscreenCanvasWorkerMessage {
	type: MessageType;
	payload?:
		| InitMessagePayload
		| FillRectMessagePayload
		| FillHoverRectMessagePayload
		| LineMessagePayload
		| CircleMessagePayload
		| StrokeRectMessagePayload
		| ClearRectMessagePayload
		| ClearHoverRectMessagePayload
		| ClearAllPixelsMessagePayload
		| RecordMessagePayload;
}
