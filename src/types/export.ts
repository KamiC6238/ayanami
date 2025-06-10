import type { ExportOpRecord, OpRecord } from "./record";

export interface SourceFile {
	width: number;
	height: number;
	colorsIndex: string[];
	framesIndex: string[];
	records: ExportOpRecord[];
}

export interface ImportFileConfig {
	redoStack: OpRecord[];
	colorsIndex: string[];
	framesIndex: string[];
}
