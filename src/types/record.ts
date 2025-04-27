import type { CircleTypeEnum, ToolTypeEnum } from "./config";

/**
 * @description PointRecord means a point record of a tool,
 * which is a tuple of [x, y, drawCounts].
 * x and y are the coordinates of the point,
 * and drawCounts is the number of times the point is drawn.
 * For example, if a point is drawn 3 times,
 * the PointRecord will be [x, y, 3].
 * If a point is drawn 1 time, the PointRecord will be [x, y, 1].
 *
 * @description [Tool]Record means a record of a tool,
 * which is a tuple of [toolType, pixelColor, pixelSize, points].
 * toolType is the type of the tool,
 * pixelColor is the color of the tool,
 * pixelSize is the size of the tool,
 */

export type PencilPointRecord = [number, number, number];
export type PencilRecord = [
	ToolTypeEnum,
	string,
	number,
	Array<PencilPointRecord>,
];

export type EraserPointRecord = [number, number];
export type EraserRecord = [ToolTypeEnum, number, Array<EraserPointRecord>];

export type LinePointRecord = [[number, number], [number, number]];
export type LineRecord = [ToolTypeEnum, string, number, LinePointRecord];

export type SquarePointRecord = [[number, number], [number, number]];
export type SquareRecord = [ToolTypeEnum, string, number, SquarePointRecord];

export type CirclePointRecord = [[number, number], [number, number]];
export type CircleRecord = [
	ToolTypeEnum,
	CircleTypeEnum,
	string,
	number,
	CirclePointRecord,
];

export type BucketRecord = [
	ToolTypeEnum,
	// replacementColor
	string,
	// pixelSize
	number,
	// position
	[number, number],
];

export type Record =
	| PencilRecord
	| EraserRecord
	| LineRecord
	| SquareRecord
	| CircleRecord
	| BucketRecord;

export type RecordStack = {
	undoStack: Record[];
	redoStack: Record[];
};

export interface Records {
	[tabId: string]: RecordStack;
}
