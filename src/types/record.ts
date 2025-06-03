import type { FrameTypeEnum, ToolTypeEnum } from "./config";

export type PencilPointRecord = [number, number, number];
export type PencilRecord = [
	ToolTypeEnum,
	// frameIndex
	number,
	// colorIndex
	number,
	// pixelSize
	number,
	Array<PencilPointRecord>,
];

export type EraserPointRecord = [number, number];
export type EraserRecord = [
	ToolTypeEnum,
	// frameIndex
	number,
	// colorIndex
	number,
	Array<EraserPointRecord>,
];

export type LinePointRecord = [[number, number], [number, number]];
export type LineRecord = [
	ToolTypeEnum,
	// frameIndex
	number,
	// colorIndex
	number,
	// pixelSize
	number,
	LinePointRecord,
];

export type SquarePointRecord = [[number, number], [number, number]];
export type SquareRecord = [
	ToolTypeEnum,
	// frameIndex
	number,
	// colorIndex
	number,
	// pixelSize
	number,
	SquarePointRecord,
];

export type CirclePointRecord = [[number, number], [number, number]];
export type CircleRecord = [
	ToolTypeEnum,
	// frameIndex
	number,
	// colorIndex
	number,
	// pixelSize
	number,
	CirclePointRecord,
];

export type BucketRecord = [
	ToolTypeEnum,
	// frameIndex
	number,
	// colorIndex
	number,
	// pixelSize
	number,
	// position
	[number, number],
];

export type BroomRecord = [
	ToolTypeEnum,
	// frameIndex
	number,
];

export type AddFrameRecord = [FrameTypeEnum];

export type CopyFrameRecord = [
	FrameTypeEnum,
	// frameIndex
	number,
];

export type DeleteFrameRecord = [
	FrameTypeEnum,
	// frameIndex
	number,
];

export type OpRecord = {
	returnFrameId?: string;
} & (
	| PencilRecord
	| EraserRecord
	| LineRecord
	| SquareRecord
	| CircleRecord
	| BucketRecord
	| BroomRecord
	| AddFrameRecord
	| CopyFrameRecord
	| DeleteFrameRecord
);

export interface Records {
	[tabId: string]: {
		tabId: string;
		colorsIndex: string[];
		framesIndex: string[];
		undoStack: OpRecord[];
		redoStack: OpRecord[];
	};
}
