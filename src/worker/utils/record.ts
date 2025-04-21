import type {
	FillRectMessagePayload,
	Record,
	RecordMessagePayload,
	Records,
} from "@/types";
import { ToolTypeEnum } from "@/types";
import * as pencilRecordUtils from "./pencilRecord";

const records: Records = {};

export const getUndoAndRedoStack = (tabId: string) => {
	return records[tabId] ?? [];
};

export const record = (payload: RecordMessagePayload) => {
	const { tabId, toolType } = payload;
	let record: Record | null = null;

	switch (toolType) {
		case ToolTypeEnum.Pencil: {
			record = pencilRecordUtils.makePencilRecord(payload);
			pencilRecordUtils.clearRecordPoints();
		}
	}

	if (!record) return;

	if (!records[tabId]) {
		records[tabId] = {
			undoStack: [],
			redoStack: [],
		};
	}

	records[tabId].undoStack.push(record);
};

export const updatePointsRecord = (payload: FillRectMessagePayload) => {
	const { toolType, position } = payload;

	switch (toolType) {
		case ToolTypeEnum.Pencil:
			pencilRecordUtils.updatePencilPointsRecord(position);
			break;
	}
};
