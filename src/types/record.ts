import type { ToolTypeEnum } from "./config";

export type PencilRecord = [
	ToolTypeEnum,
	/** pixel color */
	string,
	/** pixel size */
	number,
	Array<
		[
			/** x */
			number,
			/** y */
			number,
			/** draw counts at point(x, y) */
			number,
		]
	>,
];

export type Record = PencilRecord;

export interface Records {
	[tabId: string]: Record[];
}
