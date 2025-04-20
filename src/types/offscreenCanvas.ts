import type { CanvasType } from "./canvas";
import type { Position } from "./common";

export type MessageType =
	| "init"
	| "fillRect"
	| "fillHoverRect"
	| "strokeRect"
	| "clearRect"
	| "clearHoverRect"
	| "clearAllPixels";

export interface FillRectMessagePayload {
	canvasType: CanvasType;
	position: Position;
	pixelColor: string;
	pixelSize: number;
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
	canvasList: HTMLCanvasElement[];
}

export interface OffscreenCanvasWorkerMessage {
	type: MessageType;
	payload?:
		| InitMessagePayload
		| FillRectMessagePayload
		| FillHoverRectMessagePayload
		| StrokeRectMessagePayload
		| ClearRectMessagePayload
		| ClearHoverRectMessagePayload
		| ClearAllPixelsMessagePayload;
}
