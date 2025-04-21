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

export type Record = PencilRecord;

export type RecordStack = {
	undoStack: Record[];
	redoStack: Record[];
};

export interface Records {
	[tabId: string]: RecordStack;
}
