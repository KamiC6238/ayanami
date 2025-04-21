import type { ToolTypeEnum } from "./config";

/**
 * [pointX, pointYy, draw counts at point(x, y)]
 */
export type PencilPointRecord = [number, number, number];

export type PencilRecord = [
	ToolTypeEnum,
	/** pixel color */
	string,
	/** pixel size */
	number,
	Array<PencilPointRecord>,
];

export type EraserPointRecord = [number, number];

export type EraserRecord = [ToolTypeEnum, number, Array<EraserPointRecord>];

export type Record = PencilRecord | EraserRecord;

export type RecordStack = {
	undoStack: Record[];
	redoStack: Record[];
};

export interface Records {
	[tabId: string]: RecordStack;
}
