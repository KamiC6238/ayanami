import type { Record } from "./record";

export interface SourceFile {
	width: number;
	height: number;
	colorsIndex: string[];
	records: Record[];
}
