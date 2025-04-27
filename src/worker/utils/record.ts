import type {
	BucketRecord,
	CircleRecord,
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
	SquareRecord,
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

const makeEraserRecord = (
	payload: RecordMessagePayload,
): EraserRecord | null => {
	const { toolType, pixelSize } = payload;

	if (!eraserRecordPoints.length) {
		return null;
	}

	return [toolType, pixelSize, [...eraserRecordPoints]];
};

const makeLineRecord = (payload: RecordMessagePayload): LineRecord | null => {
	const {
		toolType,
		lineStartPosition,
		lineEndPosition,
		pixelColor,
		pixelSize,
	} = payload;

	if (!lineStartPosition || !lineEndPosition) {
		return null;
	}

	return [
		toolType,
		pixelColor,
		pixelSize,
		[
			[lineStartPosition.x, lineStartPosition.y],
			[lineEndPosition.x, lineEndPosition.y],
		],
	];
};

const makeSquareRecord = (
	payload: RecordMessagePayload,
): SquareRecord | null => {
	const {
		toolType,
		squareStartPosition,
		squareEndPosition,
		pixelColor,
		pixelSize,
	} = payload;

	if (!squareStartPosition || !squareEndPosition) {
		return null;
	}

	return [
		toolType,
		pixelColor,
		pixelSize,
		[
			[squareStartPosition.x, squareStartPosition.y],
			[squareEndPosition.x, squareEndPosition.y],
		],
	];
};

const makeCircleRecord = (
	payload: RecordMessagePayload,
): CircleRecord | null => {
	const {
		toolType,
		circleType,
		circleStartPosition,
		circleEndPosition,
		pixelColor,
		pixelSize,
	} = payload;

	if (!circleType || !circleStartPosition || !circleEndPosition) {
		return null;
	}

	return [
		toolType,
		circleType,
		pixelColor,
		pixelSize,
		[
			[circleStartPosition.x, circleStartPosition.y],
			[circleEndPosition.x, circleEndPosition.y],
		],
	];
};

const makeBucketRecord = (
	payload: RecordMessagePayload,
): BucketRecord | null => {
	const { toolType, pixelColor, pixelSize, position } = payload;

	if (!position) return null;

	return [toolType, pixelColor, pixelSize, [position.x, position.y]];
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
		case ToolTypeEnum.Square:
			record = makeSquareRecord(payload);
			break;
		case ToolTypeEnum.Circle:
			record = makeCircleRecord(payload);
			break;
		case ToolTypeEnum.Bucket:
			record = makeBucketRecord(payload);
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

	// Redo stack represents a possible future. If a new record occurs, that future is no longer valid — like a time paradox.
	records[tabId].redoStack.length = 0;
	records[tabId].undoStack.push(record);
};
