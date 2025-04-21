import type { Observable } from "rxjs";
import type { Position } from "./common";

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

export type SquareRectConfig = RectConfig & {
	endPosition: Position;
};

export type CircleConfig = {
	canvasType: CanvasType;
	circleStartPosition: Position;
	circleEndPosition: Position;
};

export type LineConfig = {
	canvasType: CanvasType;
	lineStartPosition: Position;
	lineEndPosition: Position;
};

export type CanvasMap = Record<CanvasType, HTMLCanvasElement | null> &
	Record<CanvasMouseEventType, Observable<MouseEvent> | null>;
