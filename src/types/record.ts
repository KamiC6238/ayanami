import type { ToolTypeEnum } from "./config";

type PencilRecords = [
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

export interface Records {
	[tabId: string]: PencilRecords[];
}
