import type { Position } from "./common";
import type { CircleTypeEnum, ToolTypeEnum } from "./config";

export interface RecordCommonConfig {
	type: ToolTypeEnum;
	color: string;
	size: number;
}

export type PencilRecord = RecordCommonConfig & {
	pos: Position;
};

export interface EraserRecord {
	type: ToolTypeEnum;
	pos: Position;
	size: number;
}

export type LineRecord = RecordCommonConfig & {
	from: Position;
	to: Position;
};

export type SquareRecord = RecordCommonConfig & {
	from: Position;
	to: Position;
};

export type CircleRecord = RecordCommonConfig & {
	subType: CircleTypeEnum;
	center: Position;
	radius: Position;
};

export type RecordConfig =
	| PencilRecord
	| EraserRecord
	| LineRecord
	| SquareRecord
	| CircleRecord;

export interface RecordMap {
	[ToolTypeEnum.Pencil]: PencilRecord;
	[ToolTypeEnum.Eraser]: EraserRecord;
	[ToolTypeEnum.Line]: LineRecord;
	[ToolTypeEnum.Square]: SquareRecord;
	[ToolTypeEnum.Circle]: CircleRecord;
}
