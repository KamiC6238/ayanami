import type { Observable } from "rxjs";
import type { Position } from "./common";
import type { ToolTypeEnum } from "./config";

export type CanvasType = "main" | "preview" | "grid";
export type CanvasMouseEventType =
	| "mouseDown$"
	| "mouseMove$"
	| "mouseUp$"
	| "mouseLeave$";

export interface RectConfig {
	position: Position;
	canvasType: CanvasType;
}

export type SquareRectConfig = {
	canvasType: CanvasType;
	squareStartPosition: Position;
	squareEndPosition: Position;
};

export type CircleConfig = {
	canvasType: CanvasType;
	circleStartPosition: Position;
	circleEndPosition: Position;
};

export type LineConfig = {
	toolType: ToolTypeEnum;
	canvasType: CanvasType;
	lineStartPosition: Position;
	lineEndPosition: Position;
};

export interface BucketConfig {
	position: Position;
}

export type Frame = Record<
	string,
	{
		snapshot: string;
	}
>;

export type FramesMap = Record<
	string,
	{
		[frameIndex: string]: Frame;
	}
>;

export type Frames = {
	frames: FramesMap;
};

export type CanvasMap = Record<CanvasType, HTMLCanvasElement | null> &
	Record<CanvasMouseEventType, Observable<MouseEvent> | null> &
	Frames;
