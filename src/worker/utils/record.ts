import type {
	ClearRectMessagePayload,
	EraserPointRecord,
	EraserRecord,
	FillRectMessagePayload,
	LineRecord,
	PencilPointRecord,
	PencilRecord,
	Position,
	Record,
	RecordMessagePayload,
	Records,
} from "@/types";
import { ToolTypeEnum } from "@/types";

const records: Records = {};
let pencilRecordPoints: PencilPointRecord[] = [];
let eraserRecordPoints: EraserPointRecord[] = [];

const clearRecordPoints = () => {
	pencilRecordPoints.length = 0;
	eraserRecordPoints.length = 0;
};

const makePencilRecord = (
	payload: RecordMessagePayload,
): PencilRecord | null => {
	const { toolType, pixelColor, pixelSize } = payload;

	if (!pencilRecordPoints.length) {
		return null;
	}

	return [toolType, pixelColor, pixelSize, [...pencilRecordPoints]];
};

const updatePencilPointsRecord = (position: Position) => {
	let saveAsNewPoint = true;

	pencilRecordPoints = [...pencilRecordPoints].map((point) => {
		const [x, y, drawCounts] = point;

		if (position.x === x && position.y === y) {
			saveAsNewPoint = false;
			return [x, y, drawCounts + 1];
		}
		return point;
	});

	if (saveAsNewPoint) {
		pencilRecordPoints.push([position.x, position.y, 1]);
	}
};

const makeEraserRecord = (
	payload: RecordMessagePayload,
): EraserRecord | null => {
	const { toolType, pixelSize } = payload;

	if (!eraserRecordPoints.length) {
		return null;
	}

	return [toolType, pixelSize, [...eraserRecordPoints]];
};

const updateEraserPointsRecord = (position: Position) => {
	let saveAsNewPoint = true;

	eraserRecordPoints = [...eraserRecordPoints].map((point) => {
		const [x, y] = point;

		if (position.x === x && position.y === y) {
			saveAsNewPoint = false;
			return [x, y];
		}
		return point;
	});

	if (saveAsNewPoint) {
		eraserRecordPoints.push([position.x, position.y]);
	}
};

const makeLineRecord = (payload: RecordMessagePayload): LineRecord | null => {
	const { lineStartPosition, lineEndPosition, pixelColor, pixelSize } = payload;

	if (!lineStartPosition || !lineEndPosition) {
		return null;
	}

	return [
		ToolTypeEnum.Line,
		pixelColor,
		pixelSize,
		[
			[lineStartPosition.x, lineStartPosition.y],
			[lineEndPosition.x, lineEndPosition.y],
		],
	];
};

export const getUndoAndRedoStack = (tabId: string) => {
	return records[tabId] ?? [];
};

export const record = (payload: RecordMessagePayload) => {
	const { tabId, toolType } = payload;
	let record: Record | null = null;

	switch (toolType) {
		case ToolTypeEnum.Pencil:
			record = makePencilRecord(payload);
			break;
		case ToolTypeEnum.Eraser:
			record = makeEraserRecord(payload);
			break;
		case ToolTypeEnum.Line:
			record = makeLineRecord(payload);
			break;
	}

	clearRecordPoints();

	if (!record) return;

	if (!records[tabId]) {
		records[tabId] = {
			undoStack: [],
			redoStack: [],
		};
	}

	records[tabId].undoStack.push(record);
};

export const updatePointsRecord = (
	payload: FillRectMessagePayload | ClearRectMessagePayload,
) => {
	const { toolType, position } = payload;

	switch (toolType) {
		case ToolTypeEnum.Pencil:
			updatePencilPointsRecord(position);
			break;
		case ToolTypeEnum.Eraser:
			updateEraserPointsRecord(position);
			break;
	}
};
