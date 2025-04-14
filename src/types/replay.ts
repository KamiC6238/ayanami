import type { Position } from "./common";
import type { CircleTypeEnum, ToolTypeEnum } from "./config";

export interface ReplayCommonConfig {
	type: ToolTypeEnum;
	color: string;
	size: number;
}

export type ReplayPencil = ReplayCommonConfig & {
	pos: Position;
};

export interface ReplayEraser {
	type: ToolTypeEnum;
	pos: Position;
	size: number;
}

export type ReplayLine = ReplayCommonConfig & {
	from: Position;
	to: Position;
};

export type ReplaySquare = ReplayCommonConfig & {
	from: Position;
	to: Position;
};

export type ReplayCircle = ReplayCommonConfig & {
	subType: CircleTypeEnum;
	center: Position;
	radius: Position;
};

export type ReplayConfig =
	| ReplayPencil
	| ReplayEraser
	| ReplayLine
	| ReplaySquare
	| ReplayCircle;
