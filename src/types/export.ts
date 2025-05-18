import type { OpRecord } from "./record";

export interface SourceFile {
	width: number;
	height: number;
	colorsIndex: string[];
	framesIndex: string[];
	records: OpRecord[];
}

export interface ImportFileConfig {
	undoStack: OpRecord[];
	colorsIndex: string[];
	framesIndex: string[];
}
